import { zodToJsonSchema } from "zod-to-json-schema";
import { z, ZodError } from "zod";

export class Schema {
  filename: string = "";
  type: any = {};
  schema: any = undefined;
  data: any = [];

  constructor(name: string, type: any) {
    this.filename = "db/" + name.toLowerCase() + ".json";
    this.type = z.object({ ...type, id: z.number() });
    this.schema = zodToJsonSchema(this.type, this.filename);
  }

  async init(): Promise<void> {
    const file = Bun.file(this.filename);
    try {
      let data = await file.json();
      this.data = data.data;
    } catch (_) {
      this.data = [];
    }
  }

  async write(): Promise<void> {
    await Bun.write(
      this.filename,
      JSON.stringify({
        schema: this.schema,
        data: this.data,
      }),
    );
  }

  async create(newObject: any): Promise<any | ZodError> {
    newObject.id = this.data.length + 1;
    try {
      this.type.parse(newObject);
      this.data.push(newObject);
      await this.write();
    } catch (e) {
      return e;
    }
  }

  findById(id: number): void {
    return this.data[id - 1];
  }

  async update(obj: any): Promise<any | ZodError> {
    try {
      this.data[obj.id] = this.type.parse(obj);
      await this.write();
      return this.data[obj.id];
    } catch (e) {
      return e;
    }
  }
}
