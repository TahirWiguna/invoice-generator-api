const Joi = require("joi");

const { responseType, response, responseCatch } = require("../utils/response");
const { validateID, validateDatatable } = require("../utils/joiValidator");
const { logger } = require("../utils/logger");
const { datatable } = require("../utils/datatable");

const { checkRolePermission } = require("../models/auth/permission.model");

const db = require("../models_sequelize");
const Op = db.Sequelize.Op;
const Items = db.item;

exports.findAll = async (req, res) => {
  const { rolesId } = req;
  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "item.read");
    if (!perm) return response(res, responseType.FORBIDDEN, "Forbidden");

    const item = await Items.findAll();
    return response(res, responseType.SUCCESS, "Success", item);
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
    const perm = await checkRolePermission(rolesId, "item.read");
    if (!perm) return response(res, responseType.FORBIDDEN, "Forbidden");

    const idValidationResult = validateID(id);
    if (idValidationResult) return idValidationResult;

    const item = await Items.findByPk(id);
    if (!item) return response(res, responseType.NOT_FOUND, "Item not found");

    return response(res, responseType.SUCCESS, "Success", item);
  } catch (error) {
    logger.error(error.message);
    responseCatch(res, error);
  }
};

exports.datatable = async (req, res) => {
  const { rolesId } = req;
  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "item.read");
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

    const dttable = datatable(Items, value);

    const item = await Items.findAndCountAll({
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
      recordsTotal: item.count,
      recordsFiltered: item.rows.length,
      data: item.rows,
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
    const perm = await checkRolePermission(rolesId, "item.create");
    if (!perm) return response(res, responseType.FORBIDDEN, "Forbidden");

    const schema = Joi.object({
      name: Joi.string().max(255).required(),
      price: Joi.number().required(),
      description: Joi.string().optional(),
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
    const { name, price, description } = value;
    const item = await Items.create({
      name,
      price,
      description,
      created_by: req.user.id,
    });

    return response(res, responseType.CREATED, "Item created", item);
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
    const perm = await checkRolePermission(rolesId, "item.update");
    if (!perm) return response(res, responseType.FORBIDDEN, "Forbidden");

    const idValidationResult = validateID(id);
    if (idValidationResult) return idValidationResult;

    const schema = Joi.object({
      name: Joi.string().max(255).optional(),
      price: Joi.number().optional(),
      description: Joi.string().optional(),
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
    const { name, price, description } = value;
    const item = await Items.findByPk(id);
    if (!item) return response(res, responseType.NOT_FOUND, "Item not found");

    if (name) item.name = name;
    if (price) item.price = price;
    if (description) item.description = description;

    item.updated_by = req.user.id;
    item.updated_at = new Date();

    await item.save();
    return response(res, responseType.UPDATED, "Item updated", item);
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
    const perm = await checkRolePermission(rolesId, "item.delete");
    if (!perm) return response(res, responseType.FORBIDDEN, "Forbidden");

    const idValidationResult = validateID(id);
    if (idValidationResult) return idValidationResult;

    // Start transaction
    const item = await Items.findByPk(id);
    if (!item) return response(res, responseType.NOT_FOUND, "Item not found");

    await item.destroy();
    return response(res, responseType.DELETED, "Item deleted");
  } catch (error) {
    logger.error(error.message);
    responseCatch(res, error);
  }
};
