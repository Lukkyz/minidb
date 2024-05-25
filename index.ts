import { Schema } from "./minidb";
import { z } from "zod";

let users = new Schema("User", {
  username: z.string(),
  email: z.string().email(),
});
await users.init();

// await users.create({
//   username: "A",
//   email: "bienaimelucas@hotmail.fr",
// });
//
// await users.create({
//   username: "B",
//   email: "bienaimelucas@hotmail.fr",
// });
//

const updated = await users.update({
  id: 2,
  username: "lol",
  email: "abcdef@email.fr",
});

const begin = performance.now();
const test = await users.data.find((user: any) => user.id === 36);
console.log(test);
console.log(performance.now() - begin);

const begint = performance.now();
console.log(users.data[35]);
console.log(performance.now() - begint);
