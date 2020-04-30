const htmlCache = {};

export const fetchHTML = (url, cache = true) => {
  return new Promise((resolve, reject) => {

    // check cache first
    if (cache && htmlCache[url]) {
        resolve(htmlCache[url]);
        return;
    }

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
      if (this.readyState !== 4) {
        return;
      }
      if (this.status !== 200) {
        reject("not found");
        return;
      }
      if (cache) {
          htmlCache[url] = this.responseText;
      }
      resolve(this.responseText);
    };
    xhr.send();
  });
};

export const tmpl = (html, options) => {
    var re = /<%(.+?)%>/g, 
		reExp = /(^( )?(var|if|for|else|switch|case|break|{|}|;))(.*)?/g, 
		code = 'with(obj) { var r=[];\n', 
		cursor = 0, 
		result,
	    	match;
	var add = function(line, js) {
		js? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
			(code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
		return add;
	}
	while(match = re.exec(html)) {
		add(html.slice(cursor, match.index))(match[1], true);
		cursor = match.index + match[0].length;
	}
	add(html.substr(cursor, html.length - cursor));
	code = (code + 'return r.join(""); }').replace(/[\r\t\n]/g, ' ');
	try { result = new Function('obj', code).apply(options, [options]); }
	catch(err) { console.error("'" + err.message + "'", " in \n\nCode:\n", code, "\n"); }
	return result;
}

export const slideDiv = (el, direction, amount = 150) => {
    let items = [el];
    let translate = 0;

    if (typeof el === 'string') {
        items = [].slice.call(document.querySelectorAll(el));
    }
    if (['left', 'right'].indexOf(direction) === -1) {
        return;
    }
    direction === 'left' ? translate -= amount : translate += amount;

    items.forEach(item => (item.style.transform = `translateX(${translate}%)`))
}
