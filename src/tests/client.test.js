const request = require("supertest");
const client = require("../models_sequelize/client");
const app = require("../app");

let token;
let createdId;

beforeAll(async () => {
  const response = await request(app).post("/login").send({
    username: "admin@hr.com",
    password: "rahasia",
  });
  token = response.body.token;
});

describe("Testing clients", () => {
  it("should create a new client", async () => {
    const response = await request(app)
      .post("/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({
        company_name: "PT. PAJERO",
        name: "Ujang",
        address: "Jl. Jalan No. 1",
        email: "ujang@gmail.com",
        phone_number: "123456789",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("status");
    expect(response.body.status).toBe(true);
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toBeDefined("id");

    createdId = response.body.data.id;
  });

  it("should fail to create a new client when form not completed", async () => {
    const response = await request(app)
      .post("/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({
        company_name: "PT. PAJERO",
      });

    expect(response.statusCode).toBe(422);
    expect(response.body).toHaveProperty("status");
    expect(response.body.status).toBe(false);
  });

  it("should fail to create a new client when email already exist", async () => {
    const response = await request(app)
      .post("/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({
        company_name: "PT. PAJERO",
        name: "Ujang",
        address: "Jl. Jalan No. 1",
        email: "ujang@gmail.com",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("status");
    expect(response.body.status).toBe(false);
  });

  it("should get the clients", async () => {
    const response = await request(app)
      .get(`/clients`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("status");
    expect(response.body.status).toBe(true);
    expect(response.body).toHaveProperty("data");
  });

  it("should get the client by id", async () => {
    const response = await request(app)
      .get(`/clients/${createdId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("status");
    expect(response.body.status).toBe(true);
    expect(response.body).toHaveProperty("data");
  });

  it("should not found the client by id", async () => {
    const response = await request(app)
      .get(`/clients/999999999999`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("status");
    expect(response.body.status).toBe(false);
  });

  it("should update the client", async () => {
    const response = await request(app)
      .put(`/clients/${createdId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        company_name: "PT. PAJERO",
        name: "Ujang edited",
        address: "Jl. Jalan No. 1",
        email: "ujang@gmail.com",
        phone_number: "123457",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("status");
    expect(response.body.status).toBe(true);
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toBeDefined("id");
  });

  it("should fail to update the client when form not completed", async () => {
    const response = await request(app)
      .put(`/clients/${createdId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        company_name: "PT. PAJERO",
      });

    expect(response.statusCode).toBe(422);
    expect(response.body).toHaveProperty("status");
    expect(response.body.status).toBe(false);
  });

  it("should fail to update the client when email already exist", async () => {
    const response = await request(app)
      .put(`/clients/${createdId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        company_name: "PT. PAJERO",
        name: "Ujang edited",
        address: "Jl. Jalan No. 1",
        email: "",
      });

    expect(response.statusCode).toBe(400);
  });

  it("should delete the client", async () => {
    const response = await request(app)
      .delete(`/clients/${createdId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("status");
    expect(response.body.status).toBe(true);
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toBeDefined("id");
  });
});
