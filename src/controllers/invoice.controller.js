const Joi = require("joi");
const fs = require("fs");
const ejs = require("ejs");
const path = require("path");

const { responseType, response, responseCatch } = require("../utils/response");
const { validateID, validateDatatable } = require("../utils/joiValidator");
const { logger } = require("../utils/logger");
const { datatable } = require("../utils/datatable");
const sendEmail = require("../utils/email");

const { checkRolePermission } = require("../models/auth/permission.model");
const { format } = require("../utils/general");

const db = require("../models_sequelize");
const sequelize = db.sequelize;
const Op = db.Sequelize.Op;
const Invoice = db.invoice;
const InvoiceItem = db.invoice_item;
const Item = db.item;
const Client = db.client;

exports.generate = async (req, res) => {
    const { rolesId } = req;
    const t = await sequelize.transaction();
    try {
        // Validation
        const perm = await checkRolePermission(rolesId, "invoice.generate");
        if (!perm) return response(res, responseType.FORBIDDEN, "Forbidden");

        const rules = Joi.object({
            due_date: Joi.date().iso().required(),
            client_id: Joi.number().required(),
            items: Joi.array()
                .items(
                    Joi.object({
                        id: Joi.number().required(),
                        qty: Joi.number().required(),
                    })
                )
                .required(),
            payment_method_id: Joi.number().required(),
        });

        const { error, value } = rules.validate(req.body, { abortEarly: false });
        if (error) return response(res, responseType.VALIDATION_ERROR, "Form Validation Error", error.details);

        // Start transaction
        const { due_date, client_id, items, payment_method_id } = value;
        const client = await Client.findByPk(client_id);
        if (!client) return response(res, responseType.NOT_FOUND, "Client not found");

        const invoice = await Invoice.create(
            {
                due_date,
                client_id,
                payment_method_id,
                status: "unpaid",
                created_by: req.user.id,
            },
            { transaction: t }
        );

        let total_amount = 0;
        const processItems = async (items, invoice) => {
            for (const item of items) {
                try {
                    const { id, qty } = item;
                    const data_item = await Item.findByPk(id);
                    if (!data_item) throw new Error("Item not found");
                    const { name, price, description } = data_item;

                    await InvoiceItem.create(
                        {
                            invoice_id: invoice.id,
                            item_name: name,
                            item_price: price,
                            item_description: description,
                            quantity: qty,
                            total_price: price * qty,
                        },
                        { transaction: t }
                    );
                    total_amount += price * qty;
                } catch (error) {
                    logger.error(error.message);
                    throw error;
                }
            }
        };
        const proc = await processItems(items, invoice);

        invoice.total_amount = total_amount;
        await invoice.save({ transaction: t });

        const result = await Invoice.findByPk(invoice.id, {
            include: [
                {
                    model: InvoiceItem,
                    as: "items",
                },
                {
                    model: Client,
                    as: "client",
                },
            ],
            transaction: t,
        });

        // return response(res, responseType.CREATED, "Success", result);

        // SEND EMAIL
        try {
            const template = fs.readFileSync(path.join(__dirname, "../ejs/email.template.ejs"), "utf-8");
            const template_data = {
                data: result,
                format,
            };
            const html = ejs.compile(template)(template_data);
            const send = await sendEmail(client.email, "Invoice", html);
        } catch (error) {
            await t.rollback();
            return responseCatch(res, error);
            // return response(
            //   res,
            //   responseType.FAILED,
            //   error || "Failed to send email"
            // );
        }

        await t.commit();

        return response(res, responseType.CREATED, "Success", result);
    } catch (error) {
        await t.rollback();
        logger.error(error.message);
        responseCatch(res, error);
    }
};
