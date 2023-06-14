const Joi = require("joi");

const db = require("../../models_sequelize");
const Op = db.Sequelize.Op;
const RolesPermission = db.roles_permission;

const { checkRolePermission } = require("../../models/auth/permission.model");

const { validateID, validateDatatable } = require("../../utils/joiValidator");
const {
  responseType,
  response,
  responseCatch,
} = require("../../utils/response");
const { logger } = require("../../utils/logger");
const { datatable } = require("../../utils/datatable");

exports.findAll = async (req, res) => {
  const { rolesId } = req;
  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "roles_permission.read");
    if (!perm) return response(res, responseType.FORBIDDEN);

    // Start transaction
    const roles_permission = await RolesPermission.findAll({
      include: [
        {
          model: db.roles,
          attributes: ["id", "name"],
        },
        {
          model: db.permission,
          attributes: ["id", "name"],
        },
        {
          model: db.users,
          as: "creator",
          attributes: ["id", "fullname", "email"],
        },
      ],
    });

    return response(
      res,
      responseType.SUCCESS,
      "Get all data success",
      roles_permission
    );
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
    const perm = await checkRolePermission(rolesId, "roles_permission.read");
    if (!perm) return response(res, responseType.FORBIDDEN);

    const idValidationResult = validateID(id, res);
    if (idValidationResult) return idValidationResult;

    // Start transaction
    const roles_permission = await RolesPermission.findByPk(id, {
      include: [
        {
          model: db.roles,
          attributes: ["id", "name"],
        },
        {
          model: db.permission,
          attributes: ["id", "name"],
        },
        {
          model: db.users,
          as: "creator",
          attributes: ["id", "fullname", "email"],
        },
      ],
    });

    if (!roles_permission) {
      return response(res, responseType.NOT_FOUND, "Data not found");
    }

    return response(
      res,
      responseType.SUCCESS,
      "Get data by id success",
      roles_permission
    );
  } catch (error) {
    logger.error(error.message);
    responseCatch(res, error);
  }
};

exports.datatable = async (req, res) => {
  const { rolesId } = req;
  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "permission.read");
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

    const orderColumn = order[0].column;
    const orderDir = order[0].dir;
    const orderColumnName = columns[orderColumn].data;

    const dttable = datatable(RolesPermission, value);

    const rolesPermission = await RolesPermission.findAndCountAll({
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
      recordsTotal: rolesPermission.count,
      recordsFiltered: rolesPermission.rows.length,
      data: rolesPermission.rows,
    });
  } catch (error) {
    logger.error(error.message);
    responseCatch(res, error);
  }
};

exports.create = async (req, res) => {
  const { rolesId, user } = req;
  try {
    const perm = await checkRolePermission(rolesId, "roles_permission.create");
    if (!perm) return response(res, responseType.FORBIDDEN);

    const rules = Joi.object({
      roles_id: Joi.number().required(),
      permission_id: Joi.number().required(),
    });

    const { error, value } = rules.validate(req.body);
    if (error) {
      return response(
        res,
        responseType.VALIDATION_ERROR,
        "Form Validation Error",
        error.details
      );
    }

    const { roles_id, permission_id } = value;

    const roles_permission = await RolesPermission.create({
      roles_id: roles_id,
      permission_id: permission_id,
      created_by: user.id,
    });

    return response(
      res,
      responseType.SUCCESS,
      "Create data success",
      roles_permission
    );
  } catch (error) {
    logger.error(error.message);
    responseCatch(res, error);
  }
};

exports.update = async (req, res) => {
  const { rolesId, user } = req;
  const { id } = req.params;

  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "roles_permission.update");
    if (!perm) return response(res, responseType.FORBIDDEN);

    const idValidationResult = validateID(id, res);
    if (idValidationResult) return idValidationResult;

    const rules = Joi.object({
      roles_id: Joi.number().required(),
      permission_id: Joi.number().required(),
    });

    const { error, value } = rules.validate(req.body, { abortEarly: false });
    if (error) {
      return response(
        res,
        responseType.VALIDATION_ERROR,
        "Form Validation Error",
        error.details
      );
    }

    // Start transaction
    const { roles_id, permission_id } = value;

    const roles_permission = await RolesPermission.update(
      {
        roles_id: roles_id,
        permission_id: permission_id,
        updated_by: user.id,
      },
      { where: { id }, returning: true }
    );

    if (!roles_permission)
      return response(res, responseType.NOT_FOUND, "Data not found");

    return response(
      res,
      responseType.SUCCESS,
      "Update data success",
      roles_permission[1]
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
    const perm = await checkRolePermission(rolesId, "roles_permission.delete");
    if (!perm) return response(res, responseType.FORBIDDEN);

    const idValidationResult = validateID(id, res);
    if (idValidationResult) return idValidationResult;

    // Start transaction
    const roles_permission = await RolesPermission.destroy({ where: { id } });

    if (!roles_permission)
      return response(res, responseType.NOT_FOUND, "Data not found");

    return response(res, responseType.SUCCESS, "Delete data success");
  } catch (error) {
    logger.error(error.message);
    responseCatch(res, error);
  }
};

exports.allowModule = async (req, res) => {
  const { rolesId, user } = req;
  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "permission.create");
    if (!perm) return response(res, responseType.FORBIDDEN);

    const rules = Joi.object({
      roles_id: Joi.number().required(),
      module_name: Joi.string().allow(null, "").optional(),
    });

    const { error, value } = rules.validate(req.body, { abortEarly: false });
    if (error)
      return response(
        res,
        responseType.VALIDATION_ERROR,
        "Form Validation Error",
        error.details
      );

    // Start transaction
    const { roles_id, module_name } = value;
    const findPermission = await db.permission.findAll({
      where: module_name ? { module: module_name } : {},
    });

    if (!findPermission || findPermission.length === 0)
      return response(res, responseType.NOT_FOUND, "Permission not found");

    const createRolesPermission = async (
      roles_id,
      permission_id,
      created_by
    ) => {
      try {
        let roles_permission = await RolesPermission.create({
          roles_id: roles_id,
          permission_id: permission_id,
          created_by: created_by,
        });
        return roles_permission;
      } catch (error) {
        return null;
      }
    };

    const array = [];
    findPermission.forEach(async (permission) => {
      const roles_permission = createRolesPermission(
        roles_id,
        permission.id,
        user.id
      );
      array.push(roles_permission);
    });

    const results = await Promise.all(array);
    const filtered = results.filter((result) => result !== null);

    return response(res, responseType.SUCCESS, "Create data success", filtered);
  } catch (error) {
    logger.error(error.message);
    responseCatch(res, error);
  }
};
