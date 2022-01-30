const puppeteer = require('puppeteer');
const utilBack = require('./util-back');

(async () => {

    const args = process.argv.slice(2);
    const day = args[0];

    const input = args[1] ? utilBack.getTestInput(day, args[1]) : utilBack.getMainInput(day);

    const browser = await puppeteer.launch({headless: false});
  
    const page = await browser.newPage();

    async function waitForSelectors(selectors, frame) {
      for (const selector of selectors) {
        try {
          return await waitForSelector(selector, frame);
        } catch (err) {
          console.error(err);
        }
      }
      throw new Error('Could not find element for selectors: ' + JSON.stringify(selectors));
    }

    async function waitForSelector(selector, frame) {
      if (selector instanceof Array) {
        let element = null;
        for (const part of selector) {
          if (!element) {
            element = await frame.waitForSelector(part);
          } else {
            element = await element.$(part);
          }
          if (!element) {
            throw new Error('Could not find element: ' + part);
          }
          element = (await element.evaluateHandle(el => el.shadowRoot ? el.shadowRoot : el)).asElement();
        }
        if (!element) {
          throw new Error('Could not find element: ' + selector.join('|'));
        }
        return element;
      }
      const element = await frame.waitForSelector(selector);
      if (!element) {
        throw new Error('Could not find element: ' + selector);
      }
      return element;
    }

    async function waitForElement(step, frame) {
      const count = step.count || 1;
      const operator = step.operator || '>=';
      const comp = {
        '==': (a, b) => a === b,
        '>=': (a, b) => a >= b,
        '<=': (a, b) => a <= b,
      };
      const compFn = comp[operator];
      await waitForFunction(async () => {
        const elements = await querySelectorsAll(step.selectors, frame);
        return compFn(elements.length, count);
      });
    }

    async function querySelectorsAll(selectors, frame) {
      for (const selector of selectors) {
        const result = await querySelectorAll(selector, frame);
        if (result.length) {
          return result;
        }
      }
      return [];
    }

    async function querySelectorAll(selector, frame) {
      if (selector instanceof Array) {
        let elements = [];
        let i = 0;
        for (const part of selector) {
          if (i === 0) {
            elements = await frame.$$(part);
          } else {
            const tmpElements = elements;
            elements = [];
            for (const el of tmpElements) {
              elements.push(...(await el.$$(part)));
            }
          }
          if (elements.length === 0) {
            return [];
          }
          const tmpElements = [];
          for (const el of elements) {
            const newEl = (await el.evaluateHandle(el => el.shadowRoot ? el.shadowRoot : el)).asElement();
            if (newEl) {
              tmpElements.push(newEl);
            }
          }
          elements = tmpElements;
          i++;
        }
        return elements;
      }
      const element = await frame.$$(selector);
      if (!element) {
        throw new Error('Could not find element: ' + selector);
      }
      return element;
    }

    async function waitForFunction(fn) {
      let isActive = true;
      setTimeout(() => {
        isActive = false;
      }, 5000);
      while (isActive) {
        const result = await fn();
        if (result) {
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      throw new Error('Timed out');
    }
    {
        const targetPage = page;
        await targetPage.setViewport({"width":1265,"height":586})
    }
    {
    {
      const targetPage = page;
      const promises = [];
      promises.push(targetPage.waitForNavigation());
      await targetPage.goto(`http://localhost:8000/day-${day}/day-${day}.html`);
      await Promise.all(promises);
    }
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/[role=\"form\"]","aria/[role=\"textbox\"]"],["#main-input"]], targetPage);
        await element.evaluate((el, x, y) => { el.scrollTop = y; el.scrollLeft = x; }, 0, 118);
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/[role=\"form\"]","aria/[role=\"textbox\"]"],["#main-input"]], targetPage);
        const type = await element.evaluate(el => el.type);
        if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
          await element.type(input);
        } else {
          await element.focus();
          await element.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, input);
        }
    }
    // {
    //     const targetPage = page;
    //     const element = await waitForSelectors([["aria/Calculation parameters","aria/[role=\"spinbutton\"]"],["#num-steps"]], targetPage);
    //     await element.click({ offset: { x: 113, y: 0.71875} });
    // }
    // {
    //     const targetPage = page;
    //     const element = await waitForSelectors([["aria/Calculation parameters","aria/[role=\"spinbutton\"]"],["#num-steps"]], targetPage);
    //     await element.click({ offset: { x: 2, y: 8.71875} });
    // }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Part A"],["#calculate-a"]], targetPage);
        await element.click({ offset: { x: 36, y: 15.53125} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Part B"],["#calculate-b"]], targetPage);
        await element.click({ offset: { x: 26.6875, y: 10.53125} });
    }

})();
