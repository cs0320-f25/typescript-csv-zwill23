import * as fs from "fs";
import * as readline from "readline";
import { z } from "zod";

/**
 * This is a JSDoc comment. Similar to JavaDoc, it documents a public-facing
 * function for others to use. Most modern editors will show the comment when 
 * mousing over this function name. Try it in run-parser.ts!
 * 
 * File I/O in TypeScript is "asynchronous", meaning that we can't just
 * read the file and return its contents. You'll learn more about this 
 * in class. For now, just leave the "async" and "await" where they are. 
 * You shouldn't need to alter them.
 * 
 * @param path The path to the file being loaded.
 * @returns a "promise" to produce a 2-d array of cell values
 */
export async function parseCSV(path: string): Promise<string[][]> {
  // This initial block of code reads from a file in Node.js. The "rl"
  // value can be iterated over in a "for" loop. 
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity, // handle different line endings
  });
  
  // Create an empty array to hold the results
  let result = []
  
  // We add the "await" here because file I/O is asynchronous. 
  // We need to force TypeScript to _wait_ for a row before moving on. 
  // More on this in class soon!
  for await (const line of rl) {
    const values = line.split(",").map((v) => v.trim());
    result.push(values)
  }
  return result
}

export async function parseCSVZod<T>(path: string, schema?: z.ZodType<T>): Promise<string[][] | T[]> {
  
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity, 
  });

  const result: string[][] = []

  for await (const line of rl) {
    const values = line.split(",").map((v) => v.trim());
    result.push(values);
  }

  // If no schema, then just return the aray of string arrays
  if (!schema) return result;

  // If schema is given, validate and transform
  const transformed: T[] = [];
  const errors: string[] = [];

  result.forEach((row, idx) => {
    const parsed = schema.safeParse(row);
    if (parsed.success) {
      transformed.push(parsed.data);
    } else {
      errors.push(`row ${idx}: ${parsed.error.message}`);
    }
  });

  if (errors.length) {
    throw new Error(`CSV schema validation failed:\n${errors.join("\n")}`);
  }

  return transformed;
}