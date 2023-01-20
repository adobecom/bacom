import { expect } from '@esm-bundle/chai';
import init from '../../../blocks/event-speakers/event-speakers.js';

describe('Event Speakers', () => {
  it('adds ellipsis and button for long description', () => {
    document.body.innerHTML = `<div class="event-speakers"><div>
      <div><picture></picture></div>
      <div><h3>Firstname Lastname</h3></div>
      <div><p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa.</p></div>
      <div>Open me</div>
    </div></div>`;

    init(document.querySelector('.event-speakers'));
    expect(document.querySelector('.ellipsis')).to.exist;
    document.querySelector('button').click();
    expect(document.querySelector('.ellipsis')).to.be.null;
  });

  it('shows entire description if short', () => {
    document.body.innerHTML = `<div class="event-speakers"><div>
      <div><picture></picture></div>
      <div>Firstname Lastname</div>
      <div><p>Lorem ipsum dolor sit amet.</p></div>
    </div></div>`;
    const expected = `Firstname Lastname

Lorem ipsum dolor sit amet.`;

    init(document.querySelector('.event-speakers'));
    expect(document.querySelector('.text').innerText).equals(expected);
  });
});
