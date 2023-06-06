const moreContent = (action, btn) => {
  let area = btn.parentNode;
  if (area.classList.contains('more-area')) {
    switch (action) {
      case 'more':
        area.classList.add('complete');
        break;
      case 'less':
        area.classList.remove('complete');
        break;
    }
  }
};

const imageLoad = (url, callback) => {
  let img = new Image();
  img.src = url;
  if (img.complete) {
    callback(img.width, img.height);
  } else {
    img.onload = () => {
      callback(img.width, img.height);
      img.onload = null;
    }
  }
};

const viewImage = (url, thumbnail) => {
  let urls = [];
  let index = 0;
  let lock = false;
  if (thumbnail.tagName.toLowerCase() == 'img') {
    /*
    gallery
    ..figure
      ..thumbnail
    */
    for (let child of thumbnail.parentNode.parentNode.children) urls.push(child.firstElementChild.getAttribute('data-index'));
    index = [].indexOf.call(urls, url);
  } else {
    urls.push(url);
  }
  let viewer = new DOMParser().parseFromString(`<div class="viewer viewer-keyaction-close" data-action="close">
                                                  <figure class="viewer-image"></figure>
                                                  <div class="viewer-controls">
                                                    <div class="viewer-count g-inline-center g-txt-ellipsis"><span class="viewer-current">${index}</span>/${urls.length}</div>
                                                    <nav class="viewer-navigation">
                                                      <div class="viewer-btn g-inline-center g-txt-ellipsis viewer-keyaction-prev" data-action="prev">prev</div>
                                                      <div class="viewer-btn g-inline-center g-txt-ellipsis viewer-keyaction-next" data-action="next">next</div>
                                                    </nav>
                                                  </div>
                                                </div>`, 'text/html').body.firstElementChild;
  document.body.append(viewer);
  let imageSwitch = (index, init = false) => {
    lock = true;
    if (urls.length > 1 && init) viewer.querySelector('.viewer-controls').classList.add('show');
    viewer.querySelector('.viewer-current').innerHTML = index + 1;
    viewer.querySelector('.viewer-image').innerHTML = '<div class="viewer-loading g-txt-hide">loading...</div>';
    setTimeout(() => {
      imageLoad(urls[index], () => {
        viewer.querySelector('.viewer-image').innerHTML = '<img src="' + urls[index] + '" draggable="false" alt="" />';
        lock = false;
      });
    }, init ? 500 : 250);
  };
  let keyAction = e => {
    let keyMap = {Escape: 'close', ArrowLeft: 'prev', ArrowRight: 'next'};
    if (keyMap[e.key]) {
      /* viewer.querySelect... will report an error */
      document.body.querySelector(`.viewer-keyaction-${keyMap[e.key]}`).click();
      e.preventDefault();
    }
  };
  imageSwitch(index, true);
  window.addEventListener('keydown', keyAction);
  viewer.onclick = e => {
    if (e.target.hasAttribute('data-action')) {
      let action = e.target.getAttribute('data-action');
      switch (action) {
        case 'close':
          window.removeEventListener('keydown', keyAction);
          viewer.onclick = null;
          viewer.parentNode.removeChild(viewer);
          break;
        case 'prev':
          if (!lock) {
            index = index == 0 ? urls.length - 1 : index - 1;
            imageSwitch(index);
          }
          break;
        case 'next':
          if (!lock) {
            index = index == urls.length - 1 ? 0 : index + 1;
            imageSwitch(index);
          }
          break;
      }
    }
    e.stopPropagation();
  };
};
