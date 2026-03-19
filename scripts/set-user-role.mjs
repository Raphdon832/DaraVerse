#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import admin from "firebase-admin";

const VALID_ROLES = new Set(["admin", "mentor", "learner"]);

function readArg(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function printUsageAndExit() {
  console.error(
    "Usage: npm run set:user-role -- --uid <firebase_uid> --role <admin|mentor|learner>",
  );
  process.exit(1);
}

function loadServiceAccount() {
  const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (jsonEnv) {
    return JSON.parse(jsonEnv);
  }

  const fromEnvPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (fromEnvPath) {
    const raw = fs.readFileSync(path.resolve(fromEnvPath), "utf8");
    return JSON.parse(raw);
  }

  const localFallback = path.resolve(process.cwd(), "serviceAccountKey.json");
  if (fs.existsSync(localFallback)) {
    const raw = fs.readFileSync(localFallback, "utf8");
    return JSON.parse(raw);
  }

  throw new Error(
    "Missing service account credentials. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON.",
  );
}

const uid = readArg("--uid");
const role = readArg("--role");

if (!uid || !role) {
  printUsageAndExit();
}

if (!VALID_ROLES.has(role)) {
  console.error(`Invalid role "${role}". Allowed: admin, mentor, learner.`);
  process.exit(1);
}

try {
  const serviceAccount = loadServiceAccount();

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  const auth = admin.auth();
  const db = admin.firestore();
  const user = await auth.getUser(uid);
  const existingClaims = user.customClaims ?? {};

  await Promise.all([
    db.collection("users").doc(uid).set(
      {
        role,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    ),
    auth.setCustomUserClaims(uid, {
      ...existingClaims,
      role,
    }),
  ]);

  console.log(`Success: set role="${role}" for uid="${uid}".`);
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Failed to set user role: ${message}`);
  process.exit(1);
}
