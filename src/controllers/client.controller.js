const Joi = require("joi");

const { responseType, response, responseCatch } = require("../utils/response");
const { validateID, validateDatatable } = require("../utils/joiValidator");
const { logger } = require("../utils/logger");
const { datatable } = require("../utils/datatable");

const { checkRolePermission } = require("../models/auth/permission.model");

const db = require("../models_sequelize");
const Op = db.Sequelize.Op;
const Clients = db.client;

exports.findAll = async (req, res) => {
  const { rolesId } = req;
  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "client.read");
    if (!perm) return response(res, responseType.FORBIDDEN, "Forbidden");

    const client = await Clients.findAll();
    return response(res, responseType.SUCCESS, "Success", client);
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
    const perm = await checkRolePermission(rolesId, "client.read");
    if (!perm) return response(res, responseType.FORBIDDEN, "Forbidden");

    const idValidationResult = validateID(id);
    if (idValidationResult) return idValidationResult;

    const client = await Clients.findByPk(id);
    if (!client)
      return response(res, responseType.NOT_FOUND, "Client not found");

    return response(res, responseType.SUCCESS, "Success", client);
  } catch (error) {
    logger.error(error.message);
    responseCatch(res, error);
  }
};

exports.datatable = async (req, res) => {
  const { rolesId } = req;
  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "client.read");
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

    const dttable = datatable(Clients, value);

    const client = await Clients.findAndCountAll({
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
      recordsTotal: client.count,
      recordsFiltered: client.rows.length,
      data: client.rows,
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
    const perm = await checkRolePermission(rolesId, "client.create");
    if (!perm) return response(res, responseType.FORBIDDEN, "Forbidden");

    const schema = Joi.object({
      company_name: Joi.string().max(255).required(),
      name: Joi.string().max(255).required(),
      address: Joi.string().max(255).required(),
      email: Joi.string().email().max(255).required(),
      phone_number: Joi.string().max(255).required(),
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
    const client = await Clients.create({
      company_name,
      name,
      address,
      email,
      phone_number,
      created_by: req.user.id,
    });

    return response(res, responseType.CREATED, "Client created", client);
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
    const perm = await checkRolePermission(rolesId, "client.update");
    if (!perm) return response(res, responseType.FORBIDDEN, "Forbidden");

    const idValidationResult = validateID(id);
    if (idValidationResult) return idValidationResult;

    const schema = Joi.object({
      company_name: Joi.string().max(255).optional(),
      name: Joi.string().max(255).optional(),
      address: Joi.string().max(255).optional(),
      email: Joi.string().email().max(255).optional(),
      phone_number: Joi.string().max(255).optional(),
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
    const client = await Clients.findByPk(id);
    if (!client)
      return response(res, responseType.NOT_FOUND, "Client not found");

    if (company_name) client.company_name = company_name;
    if (name) client.name = name;
    if (address) client.address = address;
    if (email) client.email = email;
    if (phone_number) client.phone_number = phone_number;

    client.updated_by = req.user.id;
    client.updated_at = new Date();

    await client.save();
    return response(res, responseType.UPDATED, "Client updated", client);
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
    const perm = await checkRolePermission(rolesId, "client.delete");
    if (!perm) return response(res, responseType.FORBIDDEN, "Forbidden");

    const idValidationResult = validateID(id);
    if (idValidationResult) return idValidationResult;

    // Start transaction
    const client = await Clients.findByPk(id);
    if (!client)
      return response(res, responseType.NOT_FOUND, "Client not found");

    await client.destroy();
    return response(res, responseType.DELETED, "Client deleted");
  } catch (error) {
    logger.error(error.message);
    responseCatch(res, error);
  }
};
