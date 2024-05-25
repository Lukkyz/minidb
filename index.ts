import { Schema } from "./minidb";
import { z } from "zod";

let users = new Schema("User", {
  username: z.string(),
  email: z.string().email(),
});
await users.init();

const begin = performance.now();

const data = [];

for (let i = 0; i < 10000; i++) {
  data.push({
    username: "Bob",
    email: "bob@bob.com",
  });
}

await users.createMany(data);

await users.updateMany(
  {
    username: "Bob",
  },
  { username: "Alice" },
);
console.log(performance.now() - begin);
