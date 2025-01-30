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

const stubSummarySources = [
  {
    title: 'Lorem 1',
    summary: 'Lorem ipsum dolert alum signes mesun tabila',
    link: 'https://business.adobe.com/resources/holiday-shopping-report.html',
  },
  {
    title: 'Lorem 2',
    summary: 'Lorem ipsum dolert alum signes mesun tabila',
    link: 'https://business.adobe.com/customer-success-stories/ey-case-study.html',
  },
];

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

const createSources = async (sources, createTag) => {
  const cards = sources.map(async (source) => {
    const title = createTag('h4', {}, source.title);
    const summary = createTag('p', {}, source.summary);
    const link = createTag('a', { href: source.link }, source.link);

    const cardPage = await fetch(source.link);
    const html = await cardPage.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const meta = doc.querySelector('meta[property="og:image"]');
    const image = createTag('img', { src: meta.content });

    return createTag('div', { class: 'blip-card' }, [image, title, summary, link]);
  });

  return Promise.all(cards);
};

export default async function init(el) {
  const { createTag } = await import(`${LIBS}/utils/utils.js`);

  const [inputContainer, gated] = el.querySelectorAll(':scope > div');

  // const isGated = gated.children[1].textContent === 'true';
  gated.remove();

  const placeHolderText = inputContainer.children[0].textContent;
  inputContainer.children[0].remove();

  const button = createTag('button', { class: 'blip-submit' }, 'submit');
  const input = createTag('input', { type: 'text', class: 'blip-input', name: 'blip-input', id: 'blip-input', placeholder: placeHolderText });
  inputContainer.classList.add('blip-input-container');

  const summaryContainer = createTag('section', { class: 'blip-summary hidden' });
  inputContainer.append(input, button);

  const sourceCards = await createSources(stubSummarySources, createTag);
  const summarySourcesContainer = createTag('section', { class: 'blip-sources hidden' }, sourceCards);
  el.append(summaryContainer, summarySourcesContainer);

  button.addEventListener('click', async () => {
    console.log('click');
    el.querySelectorAll('.hidden').forEach((item) => item.classList.remove('hidden'));

    const userInput = input.value;
    summaryContainer.classList.add('loading');
    summaryContainer.innerText = 'Loading';
    const response = await requestFromLLM(userInput);
    summaryContainer.classList.remove('loading');
    console.log(response);
    summaryContainer.innerText = response;
  });
}
