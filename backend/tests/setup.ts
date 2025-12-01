import { configure } from '@testing-library/react';

configure({ testIdAttribute: 'data-test-id' });

jest.setTimeout(30000);