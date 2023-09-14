function constructPayload(form) {
  return [...form.elements].reduce((payload, formElement) => {
    if (formElement.id) {
      payload[formElement.id] = formElement.value;
    }
    return payload;
  }, {});
}

async function handleSubmit(form) {
  const payload = constructPayload(form);
  const resp = await fetch(form.dataset.action, {
    method: 'POST',
    cache: 'no-cache',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: payload }),
  });
  await resp.text();
  return payload;
}

function checkValidity(form) {
  const payload = constructPayload(form);
  const { email } = payload;
  const regex = /^[_A-Za-z0-9-+]+(\.[_A-Za-z0-9-]+)*@(?!(yahoo|hotmail|gmail|icloud|outlook))[^@]+\.[a-z]{2,}$/;
  return String(email).match(regex);
}

function createButton(field) {
  const button = document.createElement('button');
  button.textContent = field.Label;
  button.classList.add('button');
  button.classList.add('primary');
  if (field.Type === 'submit') {
    button.addEventListener('click', async (event) => {
      const form = button.closest('form');
      const block = button.closest('.form');
      event.preventDefault();
      if (checkValidity(form) !== null) {
        button.setAttribute('disabled', '');
        await handleSubmit(form);
        block.classList.add('submitted');
        const formParent = form.parentElement;
        const paragraph = document.createElement('p');
        paragraph.classList.add('form-submit-message');
        const text = document.createTextNode(field.Extra);
        paragraph.appendChild(text);
        formParent.appendChild(paragraph);
      } else {
        const emailElement = document.getElementById('email');
        if (emailElement.closest('div').childNodes.length < 2) {
          const paragraph = document.createElement('p');
          const text = document.createTextNode(field.Error);
          const label = document.querySelector('.form-label');
          label.classList.add('alert');
          paragraph.appendChild(text);
          emailElement.classList.add('highlight');
          emailElement.closest('div').appendChild(paragraph);
        }
      }
    });
  }
  return button;
}

function createInput(field) {
  const label = document.createElement('label');
  label.classList.add('form-label');
  const input = document.createElement('input');
  input.type = field.Type;
  input.id = field.Field;
  input.setAttribute('placeholder', field.Placeholder);
  if (field.Mandatory === 'x') {
    input.setAttribute('required', 'required');
  }
  label.appendChild(input);
  return label;
}

async function createForm(formURL) {
  const { pathname } = new URL(formURL);
  const resp = await fetch(pathname);
  const json = await resp.json();
  const form = document.createElement('form');
  // eslint-disable-next-line prefer-destructuring
  form.dataset.action = pathname.split('.json')[0];
  json.data.forEach((field) => {
    const fieldWrapper = document.createElement('div');
    fieldWrapper.className = `form-${field.Type}-wrapper`;
    fieldWrapper.classList.add('field-wrapper');
    switch (field.Type) {
      case 'submit':
        fieldWrapper.append(createButton(field));
        break;
      default:
        fieldWrapper.append(createInput(field));
    }
    form.append(fieldWrapper);
  });

  return form;
}

const init = async (el) => {
  const anchor = el.querySelector('p > a[href$=".json"]');
  if (anchor) {
    anchor.parentElement.replaceWith(await createForm(anchor.href));
  }
};

export default init;
