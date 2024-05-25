import { zodToJsonSchema } from "zod-to-json-schema";
import { z, ZodError } from "zod";

export class Schema {
  filename: string;
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

  async #write(): Promise<void> {
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
      await this.#write();
    } catch (e) {
      return e;
    }
  }

  async createMany(newObjects: any[]): Promise<any | ZodError> {
    for await (const newObj of newObjects) {
      newObj.id = this.data.length;
      try {
        this.type.parse(newObj);
        this.data.push(newObj);
      } catch (e) {
        return e;
      }
    }
    await this.#write();
  }

  findById(id: number): any {
    return this.data.find((element: any) => element.id === id);
  }

  async update(obj: any): Promise<any | ZodError> {
    try {
      this.data[obj.id] = this.type.parse(obj);
      await this.#write();
      return this.data[obj.id];
    } catch (e) {
      return e;
    }
  }

  async updateMany(filter: any, updatedObject: any): Promise<any | ZodError> {
    this.data.forEach((element: any, i: number) => {
      let match: boolean = true;
      for (const k of Object.keys(filter)) {
        match = match && filter[k] == element[k];
      }
      if (match) {
        this.data[i] = { ...this.data[i], ...updatedObject };
      }
    });
    await this.#write();
  }
}
