'use strict';

{{ $searchDataFile := printf "%s.search-data.json" .Language.Lang }}
{{ $searchData := resources.Get "search-data.json" | resources.ExecuteAsTemplate $searchDataFile . | resources.Minify }}

(function() {
  const input = document.querySelector('#gdoc-search-input');
  const results = document.querySelector('#gdoc-search-results');
  let showParent = {{ if .Site.Params.GeekdocSearchShowParent }}true{{ else }}false{{ end }}

  input.addEventListener('focus', init);
  input.addEventListener('keyup', search);

  function init() {
    input.removeEventListener('focus', init); // init once

    loadScript('/docs/{{ index .Site.Data.assets "js/groupBy.min.js" | relURL }}');
    loadScript('/docs/{{ index .Site.Data.assets "js/flexsearch.min.js" | relURL }}', function() {
      const indexCfg = {{ with .Scratch.Get "geekdocSearchConfig" }}{{ . | jsonify}}{{ else }}{}{{ end }};
      const dataUrl = "/docs{{ $searchData.RelPermalink }}"

      indexCfg.doc = {
        id: 'id',
        field: ['title', 'content'],
        store: ['title', 'href', 'parent'],
      };

      const index = FlexSearch.create(indexCfg);
      window.geekdocSearchIndex = index;

      getJson(dataUrl, function(data) {
        data.forEach(obj => {
          window.geekdocSearchIndex.add(obj);
        });
      });
    });
  }

  function search() {
    while (results.firstChild) {
      results.removeChild(results.firstChild);
    }

    if (!input.value) {
      return results.classList.remove("has-hits");
    }

    let searchHits = window.geekdocSearchIndex.search(input.value, 10);
    if (searchHits.length < 1) {
      return results.classList.remove("has-hits");
    }

    results.classList.add("has-hits");

    if (showParent === true) {
      searchHits = groupBy(searchHits, hit => hit.parent);
    }

    const items = [];

    if (showParent === true) {
      for (const section in searchHits) {
        const item = document.createElement('li'),
              title = item.appendChild(document.createElement('span')),
              subList = item.appendChild(document.createElement('ul'));

        title.textContent = section;
        createLinks(searchHits[section], subList);

        items.push(item);
      }
    } else {
      const item = document.createElement('li'),
            title = item.appendChild(document.createElement('span')),
            subList = item.appendChild(document.createElement('ul'));

      title.textContent = "Results";
      createLinks(searchHits, subList);

      items.push(item);
    }

    items.forEach(item => {
      results.appendChild(item);
    })
  }

  /**
   * Creates links to given pages and either returns them in an array or attaches them to a target element
   * @param {Object} pages Page to which the link should point to
   * @param {HTMLElement} target Element to which the links should be attatched
   * @returns {Array} If target is not specified, returns an array of built links
   */
  function createLinks(pages, target) {
    const items = [];

    for (const page of pages) {
      const item = document.createElement("li"),
            entry = item.appendChild(document.createElement("span")),
            a = entry.appendChild(document.createElement("a"));

      entry.classList.add("flex")

      a.href = `/docs${page.href}`;
      a.textContent = page.title;
      a.classList.add("gdoc-search__entry")

      if (target) {
        target.appendChild(item);
        continue
      }

      items.push(item);
    }

    return items;
  }

  function fetchErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
  }

  function getJson(src, callback) {
    fetch(src)
    .then(fetchErrors)
    .then(response => response.json())
    .then(json => callback(json))
    .catch(function(error) {
      console.log(error);
    });
  }

  function loadScript(src, callback) {
    let script = document.createElement('script');
    script.defer = true;
    script.async = false;
    script.src = src;
    script.onload = callback;

    document.body.appendChild(script);
  }
})();
