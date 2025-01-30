import { LIBS } from '../../scripts/scripts.js';

const URL = 'https://cchome-dev.adobe.io/int/v1/models';

const data = {
  endpoint: 'spectra-llm-v3',
  contentType: 'application/json',
  streaming: true,
  payload: {
    inputs: '',
    parameters: {
      max_new_tokens: 1000,
      top_k: 50,
      top_p: 0.9,
      do_sample: false,
      temperature: 1,
      stop: '"null"',
      repitition_penalty: 'null',
      return_full_text: 'false',
      watermark: 'true',
    },
  },
};

const headers = {
  Origin: 'https://dev-ml.hollywoodstudios.corp.adobe.com:8888',
  Referer: 'https://dev-ml.hollywoodstudios.corp.adobe.com:8888',
  'x-api-key': '',
  'Content-Type': 'application/json',
  Connection: 'keep-alive',
};

const requestFromLLM = async (userInput) => {
  const input = `[INST]${userInput}[/INST]`;

  const bodyData = data;
  bodyData.payload.inputs = input;

  const response = await fetch(URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(bodyData),
  });

  return response.text();
};

export default async function init(el) {
  const { createTag } = await import(`${LIBS}/utils/utils.js`);

  const [inputContainer, gated] = el.querySelectorAll(':scope > div');

  const isGated = gated.children[1].textContent === 'true';
  console.log(isGated);

  gated.remove();

  const placeHolderText = inputContainer.children[0].textContent;
  inputContainer.children[0].remove();

  const button = createTag('button', { class: 'blip-submit' }, 'submit');
  const input = createTag('input', { type: 'text', class: 'blip-input', name: 'blip-input', id: 'blip-input', placeholder: placeHolderText });
  inputContainer.classList.add('blip-input-container');
  const summaryContainer = createTag('section', { class: 'blip-summary' });
  inputContainer.append(input, button);
  el.append(summaryContainer);

  button.addEventListener('click', async () => {
    console.log('click');
    const userInput = input.value;
    summaryContainer.classList.add('loading');
    summaryContainer.innerText = 'Loading';
    const response = await requestFromLLM(userInput);
    summaryContainer.classList.remove('loading');
    console.log(response);
    summaryContainer.innerText = response;
  });
}
