# Sprint 1: TypeScript CSV

### Task C: Proposing Enhancement

- #### Step 1: Brainstorm on your own.
    Functionality: Because it blindly does split(",") + trim, it doesn't account for many of the CSV rules. For example, "" isn’t unescaped to ", spaces inside quotes aren’t preserved, and it can’t handle newlines within quoted fields. It also doesn’t check when a field has
    commas within.
    Extensibility: It offers no basic options like whether the CSV includes a header rather than just data. It also lacks schema-based validation. There's also no error-handling in the parser function, so users cannot tell if a specific line in their data is causing
    an issue.

    4 things to fix: Spaces inside quote should be preserved; handling when a field has commas within; handle when the CSV has a header;
    Schema-based validation

- #### Step 2: Use an LLM to help expand your perspective.
    Asking LLM: Some overlap includes issues with wuoted fields, whitespace preservation, header row support, and schema validation. Some
    things it mentioned that I did not think of include: custom delimiters, returning typed objects if schema is provided. This was especially helpful because CoPilot was able to nitroduce me to obscure test cases that I hadn't thought of. This was helpful in
    making my testing suite more comprehensive, which is crucuial to ensuring my code is as thorough as possible.

- #### Step 3: use an LLM to help expand your perspective.

    When I asked CoPilot in different ways, I did get slightly different responses. For example, I asked it in one to focus on functionality edge cases, to which is focused on more detailed edge cases regarding quotes, commas, skipping a row, whitespace.
    Whereas, if I ask it to focus on extensibility, it would give more cases to think about in terms of custom delimiters, unicode and
    encoding support. Overall, these responses were more thorough and specific as to when I asked about edge cases in general.

    Include a list of the top 4 enhancements or edge cases you think are most valuable to explore in the next week’s sprint. Label them clearly by category (extensibility vs. functionality), and include whether they came from you, the LLM, or both. Describe these using the User Story format—see below for a definition. 
    
    1) Functionality — Robust quoted fields (commas + escaped quotes) (origin: both)

    User Story:
    As a developer parsing real-world CSVs, I want fields wrapped in quotes to keep commas inside a single cell and to unescape "" to " so that my data isn’t split or misquoted.
    Acceptance Criteria:
    Given Caesar,Julius,"veni, vidi, vici", the third cell is exactly veni, vidi, vici.
    Given "He said ""hello""", the cell value is He said "hello".
    Spaces inside quotes are preserved; spaces outside quotes follow a documented trimming policy.

    2) Extensibility — Header support (origin: both)

    User Story:
    As a developer, I want to opt into header handling so that the parser is able to not just treat it as data.
    Acceptance Criteria:
    Option hasHeader: true treats the first row as column names.
    Trimming/normalizing of header names is documented and consistent.
    
    3) Functionality — Multiline quoted fields (origin: LLM)

    User Story:
    As a developer, I want quoted fields to support embedded newlines so that CSVs exported from spreadsheets parse correctly even when cells contain line breaks.
    Acceptance Criteria:
    Given A,"hello\nworld",B, the middle cell is exactly hello\nworld and the record remains a single row.
    Parser accumulates lines until the closing quote is found.
    
    4) Extensibility — Schema validation (Zod) & typed errors (origin: both)

    User Story:
    As a developer, I want to validate and coerce fields using a schema and get precise, typed errors so I can trust the data and debug quickly.
    Acceptance Criteria:
    Option schema validates each row; coercion (e.g., "23" → 23) is supported.
    On validation failure, return a typed error with row index, column name, and offending value.

    @@@@ Include your notes from above: what were your initial ideas, what did the LLM suggest, and how did the results differ by prompt? What resonated with you, and what didn’t? (3-5 sentences.) 

    - My initial ideas focused on core functionality gaps: handling commas and quotes correctly, preserving spaces inside quotes, adding header support, and integrating schema validation. The LLM reinforced those points but also pushed me to think about extensibility, like custom delimiters, Unicode/encoding support, and returning typed objects when schemas are provided. I noticed that the results varied by how I framed the prompt—when I asked about functionality, I got very detailed edge cases around quoting and whitespace, while asking about extensibility gave me broader design features. What resonated most with me was how the LLM expanded my test suite ideas with tricky edge cases I hadn’t considered. Some of the extra suggestions, like advanced encoding support, felt less immediately useful for my sprint but good to keep in mind for long-term robustness.



### Design Choices
    I opted to create an additional parser function parserCSVZod rather than modifying the original parser function. This is because, aside from the Zod validation and transformation, the rest of the functionality is the same, so I wanted to be able to reference the given parserCSV function. For my tests, I split the tests into one for testing the edge cases for parserCSV and another for testing parserCSVZod, where I focused on testing for validation, error messages, transformation, as well as if no schema is provided. In parserCSVZod, I implemented it so that if there were an error, it would send an error message that shows what row the error is in. From the persepctive of someone who is debugging, this seems like a way to make the process of finding the error a lot easier.


### 1340 Supplement

- #### 1. Correctness
    A CSV parser is correct if it turns the raw text into structured rows and columns without losing or inventing data. It should handle edge cases like quoted fields, commas inside quotes, and empty values while keeping the right number of columns across rows. When the input isn't valid, it should fail clearly and send a helpful error message.

- #### 2. Random, On-Demand Generation
    If I had a function that could generate random CSV files, I’d use it to push my parser beyond the simple cases I might come up with on my own. It would throw all sorts of odd situations at me—like messy quotes, random commas, or missing values—and I could see if the parser still held up. I’d also check that it always behaved consistently, either parsing things cleanly or failing in a clear way.

- #### 3. Overall experience, Bugs encountered and resolved
    This sprint felt different from prior programming assignments because instead of just writing code to handle fixed examples, I had to think about edge cases and use tools like Zod to validate input. What surprised me was how much subtlety there is in CSV parsing and schema validation. For example, I had to think about handling empty fields or headers or commas within a field. I didn’t really hit any major bugs, mostly because I leaned heavily on incremental testing: I validated small parts to make srue they were working as I intended before moving on.
#### Errors/Bugs: N/A
#### Tests:
    The parseCSV tests check that rows are returned as arrays and then tests edge cases based on CSV rules—quoted commas, escaped quotes, empty fields, line endings, headers, and extra spaces. Many of these deliberately fail on the naïve split(",") implementation, highlighting its flaws. 

    The parseCSVZod tests then show how adding a Zod schema enforces types, catches bad data like "Bob, thirty", handles shape mismatches, and provides clearer errors, while still allowing raw string arrays when no schema is given. Together, the tests expose the weaknesses of the current basic parser and show how schema validation improves reliability.
#### How To…
    To run tests, npm test. I split the tests into a section for the given parseCSV function, which finds edge cases that were not accounted for. I also have a section for parseCSVZod, which is essneitally parseCSV but with Zod to validate and transform the input.

    To run the parser, npm run run.

Copilot History:
    “I’m working on a CSV parser in TypeScript that currently accepts a filename as input and converts rows into strings or objects. What are some missing features or edge cases that I should consider? What improvements would make it easier for other developers to use in different kinds of apps?”

    Here are some missing features and edge cases to consider for your TypeScript CSV parser:

    Missing Features & Edge Cases
    Quoted Fields Handling:
    Fields with commas, newlines, or quotes inside quotes (e.g., "Smith, John", "Line1\nLine2", "He said ""Hello""") must be parsed correctly.
    Whitespace Preservation:
    Spaces inside quoted fields should be preserved, not trimmed.
    Header Row Support:
    Optionally treat the first row as a header and map subsequent rows to objects using those headers.
    Schema Validation:
    Allow users to specify expected types or formats for columns and validate each row against this schema.
    Error Handling:
    Provide clear error messages for malformed rows, unexpected column counts, or invalid data.
    Custom Delimiters:
    Support delimiters other than commas (e.g., tabs, semicolons).
    Line Ending Variations:
    Handle both \n and \r\n line endings.
    Empty Fields:
    Correctly handle empty fields (e.g., ,,).
    Unicode & Encoding:
    Support UTF-8 and other encodings.



#### Team members and contributions (include cs logins):

#### Collaborators (cslogins of anyone you worked with on this project and/or generative AI): 
    I used CoPilot in order to generate ideas for some of the edge cases, when building out my testing suite. This was esepcially helpful because it was able to come up with obscure test cases that I wasn't able to think of. This strengthened my testing suite and made it more thoroguh.

#### Total estimated time it took to complete project: 6
#### Link to GitHub Repo:  
