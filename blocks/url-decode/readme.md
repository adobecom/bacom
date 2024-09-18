# URL Decode Validator

This block validates that a CaaS indexed URL is able to be decoded.

## Use Case

Select a locale to fetch the query index from.
The block will then attempt to decode the URL and return the result in a table.

## Process

1. **Fetch Query Index**: The block fetches the index (`query-index.json`) based on the selected locale.
2. **Decode URLs**: The URLs from the fetched JSON are decoded using the `validateDecodedUrls` function.
3. **Validation**: Each decoded URL is validated to check if it can be successfully decoded and accessed.
4. **Generate Report**: The results are compiled into a table

## Generate Report

The URL Decode block will create a table with the following columns:

- `path`: The page where the CaaS links are indexed from.
- `validation`: Status of the URL decode.
- `count`: Number of URLs decoded.

## Validation Process

Each entry in the query index processed by parsing the caas-url column and looping through each URL. Each URL is decoded using the `parseEncodedConfig` or `decodeCompressedString` function. If any of the URLs are not able to be decoded, the validation will fail.

## Decode URLs output

The output of the URL decoding process will be an array containing the decoded configurations or `null` if the URL was not able to be decoded.

Example output:

```json
[
  {
    "path": "/resources/2021-state-work",
    "validation": "Valid",
    "count": 1
  }
]
```
