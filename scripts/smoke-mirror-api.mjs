#!/usr/bin/env node

const baseUrl = (process.env.MIRROR_API_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const cases = [
  {
    body: { entryId: "smoke-test" },
    method: "POST",
    name: "generate mirror",
  },
  {
    body: {
      answer: "This is a smoke test answer for the follow-up route.",
      entryId: "smoke-test",
      questionIndex: 0,
    },
    method: "PATCH",
    name: "answer follow-up",
  },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function headerIncludes(headers, name, value) {
  return (headers.get(name) ?? "").toLowerCase().includes(value.toLowerCase());
}

async function checkMirrorContract(testCase) {
  const response = await fetch(`${baseUrl}/api/app/mirror`, {
    body: JSON.stringify(testCase.body),
    headers: { "content-type": "application/json" },
    method: testCase.method,
  });
  const json = await response.json().catch(() => ({}));

  assert(
    response.status === 401,
    `${testCase.name}: expected unauthenticated 401, got ${response.status}`,
  );
  assert(json.error === "Unauthorized", `${testCase.name}: expected Unauthorized error body`);
  assert(headerIncludes(response.headers, "cache-control", "no-store"), `${testCase.name}: missing no-store`);
  assert(headerIncludes(response.headers, "cache-control", "private"), `${testCase.name}: missing private`);
  assert(headerIncludes(response.headers, "pragma", "no-cache"), `${testCase.name}: missing no-cache pragma`);
  assert(
    headerIncludes(response.headers, "vary", "Authorization"),
    `${testCase.name}: missing Vary Authorization`,
  );
}

try {
  for (const testCase of cases) {
    await checkMirrorContract(testCase);
  }
  console.log(`Mirror API smoke test passed against ${baseUrl}`);
} catch (error) {
  if (error instanceof TypeError && /fetch failed/i.test(error.message)) {
    console.error(`Could not reach ${baseUrl}. Start the app or set MIRROR_API_BASE_URL.`);
  } else {
    console.error(error instanceof Error ? error.message : error);
  }
  process.exit(1);
}
