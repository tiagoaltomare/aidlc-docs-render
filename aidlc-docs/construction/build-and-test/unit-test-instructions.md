# Unit Test Execution

## Run Unit Tests

### 1. Build the Test Output

```bash
npm run build:tests
```

### 2. Execute All Shared and Logic Tests

```bash
npm test
```

## Review Test Results

- **Expected**: all shared helper and logic tests pass with 0 failures
- **Current Limitation Observed**:
  - this environment could not execute `npm run build:tests` because `tsc` was not available on the path
- **Test Coverage Focus**:
  - document discovery helpers
  - navigator and preview state helpers
  - answer extraction and rebuild helpers
  - bootstrap planning helpers
  - refresh and delivery-readiness helpers

## Fix Failing Tests

If tests fail:
1. Review the failing suite from the Node test output
2. Identify whether the regression is in shared logic, runtime coordination, or packaging expectations
3. Fix the underlying code or update the test if behavior intentionally changed
4. Re-run `npm test` until all tests pass
