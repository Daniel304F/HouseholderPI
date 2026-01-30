import { MongoClient } from "mongodb";
import { MongoGenericDAO } from "./models/mongodb/mongo.dao.js";
import { User } from "./models/user.js";
import { Group } from "./models/group.js";
import { Friendship } from "./models/friend.js";
import { Task } from "./models/task.js";
import { ActivityLog } from "./models/activityLog.js";
import { RecurringTaskTemplate } from "./models/recurringTaskTemplate.js";
import type { Express } from "express";
import config from "./config/config.js";

export default async function startDB(app: Express) {
  switch (config.db.use) {
    case "mongodb":
      await startMongoDB(app);
      break;
    default:
      startInMemoryDB(app);
  }
  return async () => Promise.resolve();
}

async function startMongoDB(app: Express) {
  const db = (await connectToMongoDB()).db(config.db.connect.database);
  app.locals["userDAO"] = new MongoGenericDAO<User>(db, "users");
  app.locals["groupDAO"] = new MongoGenericDAO<Group>(db, "groups");
  app.locals["friendshipDAO"] = new MongoGenericDAO<Friendship>(
    db,
    "friendships",
  );
  app.locals["taskDAO"] = new MongoGenericDAO<Task>(db, "tasks");
  app.locals["activityLogDAO"] = new MongoGenericDAO<ActivityLog>(
    db,
    "activityLogs",
  );
  app.locals["recurringTaskDAO"] = new MongoGenericDAO<RecurringTaskTemplate>(
    db,
    "recurringTaskTemplates",
  );
}

async function startInMemoryDB(_app: Express) {
  // TODO: DAOs erstellen und in app.locals ablegen
  //app.locals.userDAO = new InMemoryGenericDAO<User>();
}

async function connectToMongoDB() {
  const url = `mongodb://${config.db.connect.host}:${config.db.connect.port.mongodb}`;
  const client = new MongoClient(url, {
    auth: {
      username: config.db.connect.user,
      password: config.db.connect.password,
    },
    authSource: config.db.connect.authSource,
  });
  try {
    await client.connect();
  } catch (err) {
    console.log("Could not connect to MongoDB: ", err);
    process.exit(1);
  }
  return client;
}
