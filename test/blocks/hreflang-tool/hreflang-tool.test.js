import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import init from '../../../blocks/hreflang-tool/hreflang-tool.js';

describe('Hreflang Tool', () => {
  let container;

  beforeEach(async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    container = document.querySelector('.hreflang-tool');
    await init(container);
  });

  it('updates textarea when checkboxes are checked', () => {
    // Get some test checkboxes
    const auCheckbox = container.querySelector('#locale-au');
    const caCheckbox = container.querySelector('#locale-ca');
    const textarea = container.querySelector('.hreflang-output');

    // Check the boxes
    auCheckbox.click();
    expect(textarea.value).to.equal('au: en-AU');

    caCheckbox.click();
    expect(textarea.value).to.equal('au: en-AU; ca: en-CA');

    // Uncheck a box
    auCheckbox.click();
    expect(textarea.value).to.equal('ca: en-CA');
  });

  it('copies text to clipboard when copy button is clicked', async () => {
    // Mock clipboard API
    const mockClipboard = { writeText: sinon.stub().resolves() };
    const originalNavigator = window.navigator;
    Object.defineProperty(window, 'navigator', {
      value: { clipboard: mockClipboard },
      configurable: true,
    });

    // Set up test data
    const textarea = container.querySelector('.hreflang-output');
    const copyButton = container.querySelector('.copy-button');
    const testText = 'test: en-US';
    textarea.value = testText;

    // Click copy button
    await copyButton.click();

    // Verify clipboard was called with correct text
    expect(mockClipboard.writeText.calledWith(testText)).to.be.true;

    // Verify button shows 'Copied!'
    expect(copyButton.textContent).to.equal('Copied!');

    // Restore original navigator
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      configurable: true,
    });
  });
});
