---
id: testing
name: Test Generation
description: A template for generating thorough test cases for code
category: testing
---

# AI Test Generation Prompt

Please generate comprehensive test cases for the provided code:

## Unit Tests
- Test each function/method in isolation
- Consider edge cases, boundary values, and invalid inputs
- Test both success and failure paths
- Ensure proper error handling

## Mock Strategy
- Identify dependencies that should be mocked
- Define mock implementations or behaviors
- Ensure mocks accurately represent the real dependencies

## Integration Tests
- Test interactions between components
- Test API endpoints and data flow
- Test database interactions if applicable

## Test Data
- Generate sample test data
- Include both valid and invalid data sets
- Consider different data sizes

## Performance Tests
- Define performance benchmarks
- Test with varying loads
- Identify performance bottlenecks

## Test Coverage
- Aim for >80% code coverage
- Identify hard-to-test code
- Suggest refactoring for testability if needed

## Security Tests
- Test for common vulnerabilities
- Test authentication and authorization
- Test input validation and sanitization 