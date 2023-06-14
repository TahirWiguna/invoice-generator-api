const Joi = require("joi");

const { responseType, response, responseCatch } = require("../utils/response");
const { validateID, validateDatatable } = require("../utils/joiValidator");
const { logger } = require("../utils/logger");
const { datatable } = require("../utils/datatable");

const { checkRolePermission } = require("../models/auth/permission.model");

const db = require("../models_sequelize");
const Op = db.Sequelize.Op;
const Pmethod = db.master_payment_method;

exports.findAll = async (req, res) => {
  const { rolesId } = req;
  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "payment_method.read");
    if (!perm) return response(res, responseType.FORBIDDEN, "Forbidden");

    const payment_method = await Pmethod.findAll();
    return response(res, responseType.SUCCESS, "Success", payment_method);
  } catch (error) {
    logger.error(error.message);
    responseCatch(res, error);
  }
};

exports.findById = async (req, res) => {
  const { rolesId } = req;
  const { id } = req.params;

  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "payment_method.read");
    if (!perm) return response(res, responseType.FORBIDDEN, "Forbidden");

    const idValidationResult = validateID(id);
    if (idValidationResult) return idValidationResult;

    const payment_method = await Pmethod.findByPk(id);
    if (!payment_method)
      return response(res, responseType.NOT_FOUND, "Payment method not found");

    return response(res, responseType.SUCCESS, "Success", payment_method);
  } catch (error) {
    logger.error(error.message);
    responseCatch(res, error);
  }
};

exports.datatable = async (req, res) => {
  const { rolesId } = req;
  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "payment_method.read");
    if (!perm) return response(res, responseType.FORBIDDEN);

    const { error, value } = validateDatatable(req);
    if (error) {
      return response(
        res,
        responseType.VALIDATION_ERROR,
        "Form Validation Error",
        error.details
      );
    }

    // Start transaction
    const { draw, start, length, search, order, columns } = value;

    const orderDir = order[0].dir;
    const orderColumnName = columns[order[0].column].data;

    const dttable = datatable(Pmethod, value);

    const payment_method = await Pmethod.findAndCountAll({
      where: dttable,
      order: [[orderColumnName, orderDir]],
      offset: start,
      limit: length,
      include: [
        {
          model: db.users,
          as: "creator",
          attributes: ["id", "fullname", "email"],
        },
      ],
    });

    return response(res, responseType.SUCCESS, "Get data success", {
      draw,
      recordsTotal: payment_method.count,
      recordsFiltered: payment_method.rows.length,
      data: payment_method.rows,
    });
  } catch (error) {
    logger.error(error.message);
    responseCatch(res, error);
  }
};

exports.create = async (req, res) => {
  const { rolesId } = req;

  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "payment_method.create");
    if (!perm) return response(res, responseType.FORBIDDEN, "Forbidden");

    const schema = Joi.object({
      name: Joi.string().max(255).required(),
    });

    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error)
      return response(
        res,
        responseType.VALIDATION_ERROR,
        "Form Validation Error",
        error.details
      );

    // Start transaction
    const { name } = value;
    const payment_method = await Pmethod.create({
      name,
      created_by: req.user.id,
    });

    return response(
      res,
      responseType.CREATED,
      "Payment method created",
      payment_method
    );
  } catch (error) {
    logger.error(error.message);
    responseCatch(res, error);
  }
};

exports.update = async (req, res) => {
  const { rolesId } = req;
  const { id } = req.params;

  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "payment_method.update");
    if (!perm) return response(res, responseType.FORBIDDEN, "Forbidden");

    const idValidationResult = validateID(id);
    if (idValidationResult) return idValidationResult;

    const schema = Joi.object({
      name: Joi.string().max(255).optional(),
    });

    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error)
      return response(
        res,
        responseType.VALIDATION_ERROR,
        "Form Validation Error",
        error.details
      );

    // Start transaction
    const { company_name, name, address, email, phone_number } = value;
    const payment_method = await Pmethod.findByPk(id);
    if (!payment_method)
      return response(res, responseType.NOT_FOUND, "Payment method not found");

    if (name) payment_method.name = name;

    payment_method.updated_by = req.user.id;
    payment_method.updated_at = new Date();

    await payment_method.save();
    return response(
      res,
      responseType.UPDATED,
      "Payment method updated",
      payment_method
    );
  } catch (error) {
    logger.error(error.message);
    responseCatch(res, error);
  }
};

exports.delete = async (req, res) => {
  const { rolesId } = req;
  const { id } = req.params;

  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "payment_method.delete");
    if (!perm) return response(res, responseType.FORBIDDEN, "Forbidden");

    const idValidationResult = validateID(id);
    if (idValidationResult) return idValidationResult;

    // Start transaction
    const payment_method = await Pmethod.findByPk(id);
    if (!payment_method)
      return response(res, responseType.NOT_FOUND, "Payment method not found");

    await payment_method.destroy();
    return response(res, responseType.DELETED, "Payment method deleted");
  } catch (error) {
    logger.error(error.message);
    responseCatch(res, error);
  }
};
