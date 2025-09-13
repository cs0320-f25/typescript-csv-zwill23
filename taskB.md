Functionality: Because it blindly does split(",") + trim, it doesn't account for many of the CSV rules. For example, "" isn’t unescaped to ", spaces inside quotes aren’t preserved, and it can’t handle newlines within quoted fields. It also doesn’t check when a field has
commas within.
Extensibility: It offers no basic options like whether the CSV includes a header rather than just data. It also lacks schema-based validation. There's also no error-handling in the parser function, so users cannot tell if a specific line in their data is causing
an issue.

4 things to fix: Spaces inside quote should be preserved; handling when a field has commas within; handle when the CSV has a header;
Schema-based validation

Asking LLM: Some overlap includes issues with wuoted fields, whitespace preservation, header row support, and schema validation. Some
things it mentioned that I did not think of include: custom delimiters, returning typed objects if schema is provided. This was especially helpful because CoPilot was able to nitroduce me to obscure test cases that I hadn't thought of. This was helpful in
making my testing suite more comprehensive, which is crucuial to ensuring my code is as thorough as possible.

When I asked CoPilot in different ways, I did get slightly different responses. For example, I asked it in one to focus on functionality edge cases, to which is focused on more detailed edge cases regarding quotes, commas, skipping a row, whitespace.
Whereas, if I ask it to focus on extensibility, it would give more cases to think about in terms of custom delimiters, unicode and
encoding support. Overall, these responses were more thorough and specific as to when I asked about edge cases in general.

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
