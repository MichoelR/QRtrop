// JavaScript for mismatch highlighting in verse display
function highlightMismatch(element, type, chap, verse) {
  const container = document.querySelector(`.verse-container[data-chap="${chap}"][data-verse="${verse}"]`);
  if (!container) return;
  const words = element.getAttribute('data-words').split('-');
  const startWord = parseInt(words[0]);
  const endWord = parseInt(words[1]);
  const tables = container.querySelectorAll('.segment-table');
  tables.forEach(table => {
    const cells = table.querySelectorAll('td[data-word]');
    cells.forEach(cell => {
      const wordNum = parseInt(cell.getAttribute('data-word'));
      if (wordNum >= startWord && wordNum <= endWord) {
        if (type === 'trop') {
          cell.classList.add('highlight-trop');
          cell.classList.remove('highlight-syntax');
        } else {
          cell.classList.add('highlight-syntax');
          cell.classList.remove('highlight-trop');
        }
      } else {
        cell.classList.remove('highlight-trop', 'highlight-syntax');
      }
    });
  });
}

function highlightWordRange(cell, chap, verse) {
  const container = document.querySelector(`.verse-container[data-chap="${chap}"][data-verse="${verse}"]`);
  if (!container) return;
  const selectedRadio = container.querySelector(`input[name="mismatch-select-${chap}-${verse}"]:checked`);
  if (!selectedRadio) return;
  const tropRange = selectedRadio.getAttribute('data-trop').split('-');
  const syntaxRange = selectedRadio.getAttribute('data-syntax').split('-');
  const startTrop = parseInt(tropRange[0]);
  const endTrop = parseInt(tropRange[1]);
  const startSyntax = parseInt(syntaxRange[0]);
  const endSyntax = parseInt(syntaxRange[1]);
  const tables = container.querySelectorAll('.segment-table');
  tables.forEach(table => {
    const cells = table.querySelectorAll('td[data-word]');
    cells.forEach(c => {
      c.classList.remove('highlight-trop', 'highlight-syntax'); // Ensure previous highlights are cleared
      const wordNum = parseInt(c.getAttribute('data-word'));
      if (wordNum >= startTrop && wordNum <= endTrop) {
        c.classList.add('highlight-trop');
      } else {
        c.classList.remove('highlight-trop');
      }
      if (wordNum >= startSyntax && wordNum <= endSyntax) {
        c.classList.add('highlight-syntax');
      } else {
        c.classList.remove('highlight-syntax');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  // Initialize radio button listeners for mismatch selection
  const radioButtons = document.querySelectorAll('input[type="radio"][name^="mismatch-select-"]');
  radioButtons.forEach(radio => {
    radio.addEventListener('change', function() {
      const name = radio.getAttribute('name');
      const chapVerse = name.split('mismatch-select-')[1].split('-');
      const chap = chapVerse[0];
      const verse = chapVerse[1];
      // Clear all existing highlights for this verse before applying new ones
      const container = document.querySelector(`.verse-container[data-chap="${chap}"][data-verse="${verse}"]`);
      if (container) {
        const cells = container.querySelectorAll('td[data-word]');
        cells.forEach(cell => {
          cell.classList.remove('highlight-trop', 'highlight-syntax');
        });
      }
      highlightWordRange(null, chap, verse);
    });
  });
  // Trigger highlighting for all verses with mismatches on page load
  const containers = document.querySelectorAll('.verse-container');
  containers.forEach(container => {
    const chap = container.getAttribute('data-chap');
    const verse = container.getAttribute('data-verse');
    const radio = container.querySelector(`input[type="radio"][name="mismatch-select-${chap}-${verse}"]:checked`);
    if (radio) {
      highlightWordRange(null, chap, verse);
    }
  });
  // Setup hover effects for trop and syntax elements with specific selectors
  containers.forEach(container => {
    // Target specific elements likely to be related to trop or syntax
    setupHover(container, 'td, span', 'data-trop-group', 'highlight-trop');
    setupHover(container, 'td, span', 'data-syntax-group', 'highlight-syntax');
  });
});
// Function to setup hover effects for elements
function setupHover(container, selector, groupAttr, highlightClass) {
  const elements = container.querySelectorAll(selector);
  console.log(`Setting up hover for ${groupAttr}, selector: ${selector}, found ${elements.length} elements`);
  elements.forEach((el, index) => {
    // Log only a few elements for debugging
    if (index < 5) {
      console.log(`Element ${index}: ${el.tagName}, class: ${el.className}, text: ${el.textContent.substring(0, 20)}`);
    }
    // Add hover event to ALL elements for testing
    el.addEventListener('mouseover', function(event) {
      console.log(`Hover IN detected on ${el.tagName}, class: ${el.className}, text: ${el.textContent.substring(0, 20)}`);
      let groupId = el.getAttribute(groupAttr);
      let isTropOrSyntax = false;

      // Fallback to class name checks if group ID is not present
      if (!groupId) {
        const classList = el.className || '';
        if (groupAttr === 'data-trop-group' && (classList.includes('trop') || classList.includes('mafsik'))) {
          groupId = classList.split(' ').find(cls => cls.startsWith('trop-level-') || cls.startsWith('branch-')) || 'trop-fallback';
          isTropOrSyntax = true;
          console.log(`Trop element detected via class, using groupId: ${groupId}`);
        } else if (groupAttr === 'data-syntax-group' && classList.includes('syntax')) {
          groupId = classList.split(' ').find(cls => cls.startsWith('syntax-level-') || cls.startsWith('branch-')) || 'syntax-fallback';
          isTropOrSyntax = true;
          console.log(`Syntax element detected via class, using groupId: ${groupId}`);
        } else {
          console.log(`No ${groupAttr} or relevant class on this element`);
        }
      } else {
        console.log(`Group ID found: ${groupAttr}=${groupId}`);
        isTropOrSyntax = true;
      }

      if (groupId && isTropOrSyntax) {
        // Highlight all elements that might be related (same group or similar class)
        const groupElements = container.querySelectorAll(`[${groupAttr}="${groupId}"], .${groupId}`);
        groupElements.forEach(groupEl => {
          groupEl.classList.add(highlightClass);
        });
        // Also try to find related elements by class name if groupId is derived from class
        if (groupId.includes('trop') || groupId.includes('syntax')) {
          const classElements = container.querySelectorAll(`[class*="${groupId}"], [class*="trop"], [class*="syntax"]`);
          classElements.forEach(classEl => {
            classEl.classList.add(highlightClass);
          });
        }
        // Highlight associated word
        const wordId = el.getAttribute('data-word');
        if (wordId) {
          const wordEl = container.querySelector(`td[data-word="${wordId}"]`);
          if (wordEl) {
            wordEl.classList.add('highlight-word');
            console.log(`Highlighted word ID ${wordId}`);
          } else {
            console.log(`Word ID ${wordId} not found`);
          }
        }
      }
    });
    el.addEventListener('mouseout', function(event) {
      console.log(`Hover OUT detected on ${el.tagName}, class: ${el.className}, text: ${el.textContent.substring(0, 20)}`);
      let groupId = el.getAttribute(groupAttr);
      let isTropOrSyntax = false;

      // Fallback to class name checks if group ID is not present
      if (!groupId) {
        const classList = el.className || '';
        if (groupAttr === 'data-trop-group' && (classList.includes('trop') || classList.includes('mafsik'))) {
          groupId = classList.split(' ').find(cls => cls.startsWith('trop-level-') || cls.startsWith('branch-')) || 'trop-fallback';
          isTropOrSyntax = true;
        } else if (groupAttr === 'data-syntax-group' && classList.includes('syntax')) {
          groupId = classList.split(' ').find(cls => cls.startsWith('syntax-level-') || cls.startsWith('branch-')) || 'syntax-fallback';
          isTropOrSyntax = true;
        }
      } else {
        isTropOrSyntax = true;
      }

      if (groupId && isTropOrSyntax) {
        // Remove highlight from all elements in the same group or class
        const groupElements = container.querySelectorAll(`[${groupAttr}="${groupId}"], .${groupId}, [class*="${groupId}"], [class*="trop"], [class*="syntax"]`);
        groupElements.forEach(groupEl => {
          groupEl.classList.remove(highlightClass);
        });
        // Remove highlight from associated word
        const wordId = el.getAttribute('data-word');
        if (wordId) {
          const wordEl = container.querySelector(`td[data-word="${wordId}"]`);
          if (wordEl) {
            wordEl.classList.remove('highlight-word');
          }
        }
      }
    });
  });
}
