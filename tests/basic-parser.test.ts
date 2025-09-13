import { parseCSV } from "../src/basic-parser";
import { parseCSVZod } from "../src/basic-parser";
import { z } from "zod";
import * as path from "path";
import { promises as fsp } from "fs";
import * as os from "os";

const PEOPLE_CSV_PATH = path.join(__dirname, "../data/people.csv");


test("parseCSV yields arrays", async () => {
  const results = await parseCSV(PEOPLE_CSV_PATH)
  
  expect(results).toHaveLength(5);
  expect(results[0]).toEqual(["name", "age"]);
  expect(results[1]).toEqual(["Alice", "23"]);
  expect(results[2]).toEqual(["Bob", "thirty"]); // why does this work? :(
  expect(results[3]).toEqual(["Charlie", "25"]);
  expect(results[4]).toEqual(["Nim", "22"]);
});

test("parseCSV yields only arrays", async () => {
  const results = await parseCSV(PEOPLE_CSV_PATH)
  for(const row of results) {
    expect(Array.isArray(row)).toBe(true);
  }
});


/** Helper to write a temp CSV file and return its absolute path */
async function writeTempCSV(contents: string, name = "tmp.csv"): Promise<string> {
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), "csv-"));
  const file = path.join(dir, name);
  await fsp.writeFile(file, contents, "utf8");
  return file;
}

describe("Testing parseCSV", () => {
  test("One field that has commas within should be kept as a single field", async () => {
    const file = await writeTempCSV('Caesar,Julius,"veni, vidi, vici"\n');
    const rows = await parseCSV(file);
    expect(rows).toEqual([["Caesar", "Julius", "veni, vidi, vici"]]);
  });

  test('escaped double quotes inside a quoted field parse to a single quote', async () => {
    const file = await writeTempCSV('"He said ""hi"""\n');
    const rows = await parseCSV(file);
    expect(rows).toEqual([['He said "hi"']]);
  });

  test('empty quoted field parses as empty string', async () => {
    const file = await writeTempCSV('A,"",B\n');
    const rows = await parseCSV(file);
    expect(rows).toEqual([["A", "", "B"]]);
  });

  test('quoted field with commas and escaped quotes together', async () => {
    const file = await writeTempCSV('"x, ""y"", z",B\n');
    const rows = await parseCSV(file);
    expect(rows).toEqual([['x, "y", z', "B"]]);
  });

  test('not splitting on spaces', async () => {
    const file = await writeTempCSV('One two   three\n');
    const rows = await parseCSV(file);
    expect(rows).toEqual([["One two   three"]]);
  });


  test("leading and trailing commas create empty first/last columns", async () => {
    const file = await writeTempCSV(",A,B,\n");
    const rows = await parseCSV(file);
    expect(rows).toEqual([["", "A", "B", ""]]);
  });

  test("line endings are handled", async () => {
    const file = await writeTempCSV("A,B,C\r\n1,2,3\r\n");
    const rows = await parseCSV(file);
    expect(rows).toEqual([
      ["A", "B", "C"],
      ["1", "2", "3"],
    ]);
  });

  test("final line without trailing newline is parsed", async () => {
    const file = await writeTempCSV("A,B,C\n1,2,3");
    const rows = await parseCSV(file);
    expect(rows).toEqual([
      ["A", "B", "C"],
      ["1", "2", "3"],
    ]);
  });

  test("header row is treated as data", async () => {
    const file = await writeTempCSV("name1,name2,course,role\nTim,Nelson,CSCI 0320,instructor\n");
    const rows = await parseCSV(file);
    expect(rows).toEqual([
      ["name1", "name2", "course", "role"],
      ["Tim", "Nelson", "CSCI 0320", "instructor"],
    ]);
  });

  test("quoted field preserves internal spaces", async () => {
    const file = await writeTempCSV('"  padded  ",X\n');
    const rows = await parseCSV(file);
    expect(rows).toEqual([["  padded  ", "X"]]);
  });

});
describe("testing parseCSVZod", () => {
  test("schema validation passes and transforms tuple -> object", async () => {
    const file = await writeTempCSV("Alice,23\nBob,30\n");

    // tuple -> object, with number coercion
    const PersonRow = z
      .tuple([z.string(), z.coerce.number()])
      .transform(([name, age]) => ({ name, age }));
    type Person = z.infer<typeof PersonRow>;

    const out = (await parseCSVZod<Person>(file, PersonRow)) as Person[];
    expect(out).toEqual([
      { name: "Alice", age: 23 },
      { name: "Bob", age: 30 },
    ]);
  });
  test("schema validation fails, throws exception with row that caused the problem", async () => {
      const file = await writeTempCSV("Alice,23\nBob,thirty\nCharlie,25\n");

      const PersonRow = z
        .tuple([z.string(), z.coerce.number()])
        .transform(([name, age]) => ({ name, age }));

      await expect(parseCSVZod(file, PersonRow)).rejects.toThrow(/row 1:/i); //row 1 caused the problem
      await expect(parseCSVZod(file, PersonRow)).rejects.toThrow(/CSV schema validation failed/i);
    });
  test("tuple length doesn't match schema", async () => {
      const file = await writeTempCSV("A,B,C\n");

      // Expect only 2 fields, but the CSV has 3
      const TwoCols = z.tuple([z.string(), z.string()]);
      await expect(parseCSVZod(file, TwoCols)).rejects.toThrow(/CSV schema validation failed/i);
    });
  test("no schema provided, returns string[][]", async () => {
      const file = await writeTempCSV("X,1\nY,2\n");
      const rows = (await parseCSVZod(file)) as string[][];
      expect(rows).toEqual([
        ["X", "1"],
        ["Y", "2"],
      ]);
  });
});


