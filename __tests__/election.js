/* eslint-disable no-undef */
const request = require("supertest");
const cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");
// eslint-disable-next-line no-unused-vars
const { response } = require("../app");

let server, agent;

function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
};

describe("Online election test suite ", function () {
  beforeAll(async () => {
    server = app.listen(2000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("testing signup new user", async () => {
    res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    res = await agent.post("/admin").send({
      firstName: "mallik",
      lastName: "sai",
      email: "sai@test.com",
      password: "12345678",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });
  test("testing user login", async () => {
    res = await agent.get("/elections");
    expect(res.statusCode).toBe(200);
    await login(agent, "sai@test.com", "12345678");
    res = await agent.get("/elections");
    expect(res.statusCode).toBe(200);
  });
  test("testing user signout", async () => {
    let res = await agent.get("/elections");
    expect(res.statusCode).toBe(200);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/elections");
    expect(res.statusCode).toBe(302);
  });
  test("testing creating a election", async () => {
    const agent = request.agent(server);
    await login(agent, "sai@test.com", "12345678");
    const res = await agent.get("/create");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/elections").send({
      electionName: "sai1",
      publicurl: "urll",
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("testing adding a question", async () => {
    const agent = request.agent(server);
    await login(agent, "sai@test.com", "12345678");

    let res = await agent.get("/create");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/elections").send({
      electionName: "Test election",
      publicurl: "welcome",
      _csrf: csrfToken,
    });
    const groupedResponse = await agent
      .get("/elections")
      .set("Accept", "Application/json");
    const parsedResponse = JSON.parse(groupedResponse.text);
    console.log(parsedResponse);
    const electionCount = parsedResponse.elections_list.length;
    const latestElection = parsedResponse.elections_list[electionCount - 1];

    res = await agent.get(`/questionscreate/${latestElection.id}`);
    csrfToken = extractCsrfToken(res);
    res = await agent.post(`/questionscreate/${latestElection.id}`).send({
      questionname: "Age",
      description: "Above 18",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });

  test("testing deleting a question", async () => {
    const agent = request.agent(server);
    await login(agent, "sai@test.com", "12345678");

    let res = await agent.get("/create");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/elections").send({
      electionName: "CR",
      publicurl: "url3",
      _csrf: csrfToken,
    });
    const ElectionsResponse = await agent
      .get("/elections")
      .set("Accept", "Application/json");
    const parsedResponse = JSON.parse(ElectionsResponse.text);
    const electionCount = parsedResponse.elections_list.length;
    const latestElection = parsedResponse.elections_list[electionCount - 1];

    res = await agent.get(`/questionscreate/${latestElection.id}`);
    csrfToken = extractCsrfToken(res);
    await agent.post(`/questionscreate/${latestElection.id}`).send({
      questionname: "CGPA",
      description: "Above 8",
      _csrf: csrfToken,
    });

    res = await agent.get(`/questionscreate/${latestElection.id}`);
    csrfToken = extractCsrfToken(res);
    await agent.post(`/questionscreate/${latestElection.id}`).send({
      question: "ruler",
      description: "test 2",
      _csrf: csrfToken,
    });

    const groupedResponse = await agent
      .get(`/questions/${latestElection.id}`)
      .set("Accept", "application/json");
    const parsedquestionsGroupedResponse = JSON.parse(groupedResponse.text);
    const questionCount = parsedquestionsGroupedResponse.questions1.length;
    const latestQuestion =
      parsedquestionsGroupedResponse.questions1[questionCount - 1];

    res = await agent.get(`/questions/${latestElection.id}`);
    csrfToken = extractCsrfToken(res);
    const deleteResponse = await agent
      .delete(`/deletequestion/${latestQuestion.id}`)
      .send({
        _csrf: csrfToken,
      });
    console.log(deleteResponse.text);
    const parsedDeleteResponse = JSON.parse(deleteResponse.text);
    expect(parsedDeleteResponse.success).toBe(true);

    res = await agent.get(`/questions/${latestQuestion.id}`);
    csrfToken = extractCsrfToken(res);

    const deleteResponse2 = await agent
      .delete(`/deletequestion/${latestElection.id}`)
      .send({
        _csrf: csrfToken,
      });
    const parsedDeleteResponse2 = JSON.parse(deleteResponse2.text).success;
    expect(parsedDeleteResponse2).toBe(false);
  });

  test("testing updating a question", async () => {
    const agent = request.agent(server);
    await login(agent, "sai@test.com", "12345678");

    let res = await agent.get("/create");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/elections").send({
      electionName: "CR Election",
      publicurl: "url4",
      _csrf: csrfToken,
    });
    const groupedResponse = await agent
      .get("/elections")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedResponse.text);
    const electionCount = parsedGroupedResponse.elections_list.length;
    const latestElection =
      parsedGroupedResponse.elections_list[electionCount - 1];

    res = await agent.get(`/questionscreate/${latestElection.id}`);
    csrfToken = extractCsrfToken(res);
    await agent.post(`/questionscreate/${latestElection.id}`).send({
      questionname: "Test question 1",
      description: "Test description 1",
      _csrf: csrfToken,
    });

    const QuestionsResponse = await agent
      .get(`/questions/${latestElection.id}`)
      .set("Accept", "application/json");
    const parsedquestionGroupedResponse = JSON.parse(QuestionsResponse.text);
    const questionCount = parsedquestionGroupedResponse.questions1.length;
    const latestQuestion =
      parsedquestionGroupedResponse.questions1[questionCount - 1];

    res = await agent.get(
      `/elections/${latestElection.id}/questions/${latestQuestion.id}/modify`
    );
    csrfToken = extractCsrfToken(res);
    res = await agent
      .post(
        `/elections/${latestElection.id}/questions/${latestQuestion.id}/modify`
      )
      .send({
        _csrf: csrfToken,
        questionname: "what is age",
        description: "above 15",
      });
    expect(res.statusCode).toBe(302);
  });

  test("testing adding a option", async () => {
    const agent = request.agent(server);
    await login(agent, "sai@test.com", "12345678");

    let res = await agent.get("/create");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/elections").send({
      electionName: "test election",
      publicurl: "url6",
      _csrf: csrfToken,
    });
    const ElectionsResponse = await agent
      .get("/elections")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(ElectionsResponse.text);
    const electionCount = parsedGroupedResponse.elections_list.length;
    const latestElection =
      parsedGroupedResponse.elections_list[electionCount - 1];

    res = await agent.get(`/questionscreate/${latestElection.id}`);
    csrfToken = extractCsrfToken(res);
    await agent.post(`/questionscreate/${latestElection.id}`).send({
      questionname: "Marks",
      description: "Above 80",
      _csrf: csrfToken,
    });

    const QuestionsResponse = await agent
      .get(`/questions/${latestElection.id}`)
      .set("Accept", "application/json");
    const parsedquestionsGroupedResponse = JSON.parse(QuestionsResponse.text);
    const questionCount = parsedquestionsGroupedResponse.questions1.length;
    const latestQuestion =
      parsedquestionsGroupedResponse.questions1[questionCount - 1];

    res = await agent.get(
      `/displayelections/correspondingquestion/${latestElection.id}/${latestQuestion.id}/options`
    );
    csrfToken = extractCsrfToken(res);

    res = await agent
      .post(
        `/displayelections/correspondingquestion/${latestElection.id}/${latestQuestion.id}/options`
      )
      .send({
        _csrf: csrfToken,
        optionname: "testoption",
      });
    expect(res.statusCode).toBe(302);
  });

  test("testing deleting a option", async () => {
    const agent = request.agent(server);
    await login(agent, "sai@test.com", "12345678");

    let res = await agent.get("/create");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/elections").send({
      electionName: "Election",
      publicurl: "url7",
      _csrf: csrfToken,
    });
    const ElectionsResponse = await agent
      .get("/elections")
      .set("Accept", "application/json");
    const parsedElectionsResponse = JSON.parse(ElectionsResponse.text);
    const electionCount = parsedElectionsResponse.elections_list.length;
    const latestElection =
      parsedElectionsResponse.elections_list[electionCount - 1];

    res = await agent.get(`/questionscreate/${latestElection.id}`);
    csrfToken = extractCsrfToken(res);
    await agent.post(`/questionscreate/${latestElection.id}`).send({
      questionname: "testquestion1",
      description: "description",
      _csrf: csrfToken,
    });

    const QuestionsResponse = await agent
      .get(`/questions/${latestElection.id}`)
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(QuestionsResponse.text);
    const questionCount = parsedGroupedResponse.questions1.length;
    const latestQuestion = parsedGroupedResponse.questions1[questionCount - 1];

    res = await agent.get(
      `/displayelections/correspondingquestion/${latestElection.id}/${latestQuestion.id}/options`
    );
    csrfToken = extractCsrfToken(res);
    res = await agent
      .post(
        `/displayelections/correspondingquestion/${latestElection.id}/${latestQuestion.id}/options`
      )
      .send({
        _csrf: csrfToken,
        optionname: "option 2",
      });

    const OptionsResponse = await agent
      .get(
        `/displayelections/correspondingquestion/${latestElection.id}/${latestQuestion.id}/options`
      )
      .set("Accept", "application/json");
    const parsedoptionGroupedResponse = JSON.parse(OptionsResponse.text);
    console.log(parsedoptionGroupedResponse);
    const optionsCount = parsedoptionGroupedResponse.option.length;
    const latestOption = parsedoptionGroupedResponse.option[optionsCount - 1];

    res = await agent.get(
      `/displayelections/correspondingquestion/${latestElection.id}/${latestQuestion.id}/options`
    );
    csrfToken = extractCsrfToken(res);
    const deleteResponse = await agent
      .delete(`/${latestOption.id}/deleteoptions`)
      .send({
        _csrf: csrfToken,
      });
    const DeleteResponse = JSON.parse(deleteResponse.text).success;
    expect(DeleteResponse).toBe(true);

    res = await agent.get(
      `/displayelections/correspondingquestion/${latestElection.id}/${latestQuestion.id}/options`
    );
    csrfToken = extractCsrfToken(res);
    const deleteResponse2 = await agent
      .delete(`/${latestOption.id}/deleteoptions`)
      .send({
        _csrf: csrfToken,
      });
    const DeleteResponse2 = JSON.parse(deleteResponse2.text).success;
    expect(DeleteResponse2).toBe(false);
  });

  test("testing updating a option", async () => {
    const agent = request.agent(server);
    await login(agent, "sai@test.com", "12345678");

    let res = await agent.get("/create");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/elections").send({
      electionName: "election 3",
      publicurl: "url7",
      _csrf: csrfToken,
    });
    const ElectionsResponse = await agent
      .get("/elections")
      .set("Accept", "application/json");
    const parsedElectionsResponse = JSON.parse(ElectionsResponse.text);
    const electionCount = parsedElectionsResponse.elections_list.length;
    const latestElection =
      parsedElectionsResponse.elections_list[electionCount - 1];

    res = await agent.get(`/questionscreate/${latestElection.id}`);
    csrfToken = extractCsrfToken(res);
    await agent.post(`/questionscreate/${latestElection.id}`).send({
      questionname: "question 5",
      description: "description 5",
      _csrf: csrfToken,
    });

    const QuestionsResponse = await agent
      .get(`/questions/${latestElection.id}`)
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(QuestionsResponse.text);
    const questionCount = parsedGroupedResponse.questions1.length;
    const latestQuestion = parsedGroupedResponse.questions1[questionCount - 1];

    res = await agent.get(
      `/displayelections/correspondingquestion/${latestElection.id}/${latestQuestion.id}/options`
    );
    csrfToken = extractCsrfToken(res);
    res = await agent
      .post(
        `/displayelections/correspondingquestion/${latestElection.id}/${latestQuestion.id}/options`
      )
      .send({
        _csrf: csrfToken,
        optionname: "option 5",
      });

    const OptionsResponse = await agent
      .get(
        `/displayelections/correspondingquestion/${latestElection.id}/${latestQuestion.id}/options`
      )
      .set("Accept", "application/json");
    const parsedoptionGroupedResponse = JSON.parse(OptionsResponse.text);
    console.log(parsedoptionGroupedResponse);
    const optionsCount = parsedoptionGroupedResponse.option.length;
    const latestOption = parsedoptionGroupedResponse.option[optionsCount - 1];

    res = await agent.get(
      `/elections/${latestElection.id}/questions/${latestQuestion.id}/options/${latestOption.id}/modify`
    );
    csrfToken = extractCsrfToken(res);

    res = await agent
      .post(
        `/elections/${latestElection.id}/questions/${latestQuestion.id}/options/${latestOption.id}/modify`
      )
      .send({
        _csrf: csrfToken,
        optionname: "option 6",
      });
    expect(res.statusCode).toBe(302);
  });

  test("testing adding a voter", async () => {
    const agent = request.agent(server);
    await login(agent, "sai@test.com", "12345678");

    let res = await agent.get("/create");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/elections").send({
      electionName: "Test election",
      publicurl: "url9",
      _csrf: csrfToken,
    });
    const groupedResponse = await agent
      .get("/elections")
      .set("Accept", "application/json");
    const parsedResponse = JSON.parse(groupedResponse.text);
    const electionCount = parsedResponse.elections_list.length;
    const latestElection = parsedResponse.elections_list[electionCount - 1];

    res = await agent.get(`/createvoter/${latestElection.id}`);
    csrfToken = extractCsrfToken(res);
    let response = await agent.post(`/createvoter/${latestElection.id}`).send({
      voterid: "234",
      password: "12345",
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("testing deleting a voter", async () => {
    const agent = request.agent(server);
    await login(agent, "sai@test.com", "12345678");

    let res = await agent.get("/create");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/elections").send({
      electionName: "Election1",
      publicurl: "url13",
      _csrf: csrfToken,
    });
    const ElectionsResponse = await agent
      .get("/elections")
      .set("Accept", "application/json");
    const parsedElectionsResponse = JSON.parse(ElectionsResponse.text);
    const electionCount = parsedElectionsResponse.elections_list.length;
    const latestElection =
      parsedElectionsResponse.elections_list[electionCount - 1];

    res = await agent.get(`/createvoter/${latestElection.id}`);
    csrfToken = extractCsrfToken(res);
    await agent.post(`/createvoter/${latestElection.id}`).send({
      voterid: "23",
      password: "12345",
      _csrf: csrfToken,
    });

    const voterResponse = await agent
      .get(`/createvoter/${latestElection.id}`)
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(voterResponse.text);
    const voterCount = parsedGroupedResponse.voterslist.length;
    const latestvoter = parsedGroupedResponse.voterslist[voterCount - 1];
    console.log(latestvoter);
    res = await agent.get(`/voters/${latestvoter.id}`);
    csrfToken = extractCsrfToken(res);
    const deleteresponse = await agent
      .delete(`/${latestvoter.id}/voterdelete/${latestElection.id}`)
      .send({
        _csrf: csrfToken,
      });
    const parseddeleteResponse = JSON.parse(deleteresponse.text);
    expect(parseddeleteResponse.success).toBe(true);
  });

  test("testing prevewing of election", async () => {
    const agent = request.agent(server);
    await login(agent, "sai@test.com", "12345678");

    let res = await agent.get("/create");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/elections").send({
      electionName: "Election1",
      publicurl: "url11",
      _csrf: csrfToken,
    });
    const ElectionsResponse = await agent
      .get("/elections")
      .set("Accept", "application/json");
    const parsedElectionsResponse = JSON.parse(ElectionsResponse.text);
    const electionCount = parsedElectionsResponse.elections_list.length;
    const latestElection =
      parsedElectionsResponse.elections_list[electionCount - 1];

    res = await agent.get(`/election/${latestElection.id}/electionpreview`);
    csrfToken = extractCsrfToken(res);
    expect(res.statusCode).toBe(200);
  });

  test("testing the launching of an election", async () => {
    const agent = request.agent(server);
    await login(agent, "sai@test.com", "12345678");

    res = await agent.get("/create");
    csrfToken = extractCsrfToken(res);
    await agent.post("/elections").send({
      electionName: "Election1",
      publicurl: "url11",
      _csrf: csrfToken,
    });
    const ElectionsResponse = await agent
      .get("/elections")
      .set("Accept", "Application/json");
    const parsedElectionsResponse = JSON.parse(ElectionsResponse.text);
    const electionCount = parsedElectionsResponse.elections_list.length;
    const electionlist =
      parsedElectionsResponse.elections_list[electionCount - 1];

    res = await agent.get(`/listofelections/${electionlist.id}`);
    const token = extractCsrfToken(res);

    const result = await agent.get(`/election/${electionlist.id}/launch`).send({
      _csrf: token,
    });

    expect(result.statusCode).toBe(302);
  });
  test("testing voter login", async () => {
    const agent = request.agent(server);
    await login(agent, "sai@test.com", "12345678");

    let res = await agent.get("/create");
    csrfToken = extractCsrfToken(res);
    await agent.post("/elections").send({
      electionName: "Election1",
      publicurl: "url18",
      _csrf: csrfToken,
    });
    const ElectionsResponse = await agent
      .get("/elections")
      .set("Accept", "Application/json");
    const parsedElectionsResponse = JSON.parse(ElectionsResponse.text);
    const electionCount = parsedElectionsResponse.elections_list.length;
    const electionlist =
      parsedElectionsResponse.elections_list[electionCount - 1];

    await agent.get("/signout");
    let voterview = await agent.get(`/externalpage/${electionlist.publicurl}`);
    csrfToken = extractCsrfToken(voterview);
    res = await agent.post(`/vote/${electionlist.publicurl}`).send({
      VoterID: "011",
      password: "123456",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });

  test("testing the launch and  end election functionality", async () => {
    const agent = request.agent(server);
    await login(agent, "sai@test.com", "12345678");
    let res = await agent.get("/create");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/elections").send({
      electionName: "Test election",
      publicurl: "welcome",
      _csrf: csrfToken,
    });
    const groupedResponse = await agent
      .get("/elections")
      .set("Accept", "Application/json");
    const parsedResponse = JSON.parse(groupedResponse.text);
    console.log(parsedResponse);
    const electionCount = parsedResponse.elections_list.length;
    const latestElection = parsedResponse.elections_list[electionCount - 1];
    res = await agent.get(`/election/${latestElection.id}`);
    csrfToken = extractCsrfToken(res);
    const launchelection = await agent.get(
      `/election/${latestElection.id}/launch`
    );
    expect(launchelection.status).toBe(302);
    const endelection = await agent.get(`/election/${latestElection.id}/end`);
    expect(endelection.status).toBe(302);
  });

  test("testing the functionality of previewing the result ", async () => {
    const agent = request.agent(server);
    await login(agent, "sai@test.com", "12345678");
    let res = await agent.get("/create");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/elections").send({
      electionName: "Test election",
      publicurl: "welcome",
      _csrf: csrfToken,
    });
    const groupedResponse = await agent
      .get("/elections")
      .set("Accept", "Application/json");
    const parsedResponse = JSON.parse(groupedResponse.text);
    console.log(parsedResponse);
    const electionCount = parsedResponse.elections_list.length;
    const latestElection = parsedResponse.elections_list[electionCount - 1];
    console.log(latestElection.publicurl);
    const finalresult = await agent.get(
      `/results/externalpage/${latestElection.publicurl}`
    );
    expect(finalresult.statusCode).toBe(200);
  });
});
