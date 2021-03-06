/* eslint-disable max-len, no-use-before-define */
import el from '../utils/element';
import { CLOSE_ICON } from '../utils/icons';

const ESC_KEY = 27;

const DEFAULT_MARKUP = ({ title, content }) => `<section>
  <h2>${ title }</h2>
  <button class="close" data-export="close"><svg width="20" height="20" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1490 1322q0 40-28 68l-136 136q-28 28-68 28t-68-28l-294-294-294 294q-28 28-68 28t-68-28l-136-136q-28-28-28-68t28-68l294-294-294-294q-28-28-28-68t28-68l136-136q28-28 68-28t68 28l294 294 294-294q28-28 68-28t68 28l136 136q28 28 28 68t-28 68l-294 294 294 294q28 28 28 68z"/></svg></button>
  ${ content }
</section>`;
const MULTIPLE_PAGES_MARKUP = ({ buttons, content }, index) => `<section class="multiple-pages">
  <ul class="sub-nav">
    ${ buttons.map((label, i) => `<li class="${ i === index ? 'active' : '' }"><a href="javascript:void(0);" data-export="page:${ i }">${ label }</a></li>`).join('') }
  </ul>
  <button class="close" data-export="close">${ CLOSE_ICON(24) }</button>
  <div class="content">${ content[index] }</div>
</section>`;

export default function popup(config) {
  const container = el.fromString('<div class="popup"></div>');
  const body = el.withRelaxedCleanup('body');
  const layout = el.withRelaxedCleanup('.layout');
  const escHandler = e => (e.keyCode === ESC_KEY && close());
  const removeKeyUpListener = body.onKeyUp(escHandler);
  const close = () => {
    removeKeyUpListener();
    container.css('opacity', 0);
    config.cleanUp && config.cleanUp();
    setTimeout(() => container.destroy(), 200);
    layout.css('filter', 'none');
  };
  const render = (markup) => {
    container.content(markup).forEach(button => {
      const dataExport = button.attr('data-export');

      if (dataExport === 'close') {
        button.onClick(close);
      } else if (dataExport.match(/^page/)) {
        button.onClick(() => render(MULTIPLE_PAGES_MARKUP(config, Number(dataExport.split(':').pop()))))
      }
    });
    config.onRender && config.onRender({
      closePopup: close,
      ...container.namedExports()
    });
  };

  layout.css('filter', 'blur(2px)');
  container.appendTo(body);
  render('buttons' in config ? MULTIPLE_PAGES_MARKUP(config, config.defaultTab) : DEFAULT_MARKUP(config));
  setTimeout(() => container.css('opacity', 1), 1);
};
