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
- `valid`: Status of the URL decode (true if all links are valid, false otherwise).
- `message`: Detailed message about the validation status.
- `count`: Number of URLs decoded.

## Validation Process

Each entry in the query index processed by parsing the caas-url column and looping through each URL. Each URL is decoded using the `parseEncodedConfig` or `decodeCompressedString` function. If any of the URLs are not able to be decoded, the validation will fail.

## Decode URLs output

The `decodeUrls` function is designed to decode an array of URLs or a single URL from a JSON string. It attempts to decode each URL using the `decodeUrl` function and returns an array of decoded configurations. If a URL cannot be decoded, null is returned for that URL.

Example output:

```json
[
  {
    "decodedKey1": "decodedValue1",
    "decodedKey2": "decodedValue2"
  },
  null
]
```
