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
  let img = new Image;
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
  let textPrefix = '';
  if (thumbnail.tagName.toLowerCase() == 'img') {
    let pagedInfo = childIndex(thumbnail.parentNode);
    textPrefix = pagedInfo[1] == 1 ? '' : pagedInfo[0] + '/' + pagedInfo[1] + ' ';
  }
  let gallery = document.createElement('figure');
  gallery.className = 'gallery-view';
  gallery.innerHTML = '<span class="view-loading">' + textPrefix + 'loading...</span>';
  document.body.append(gallery);
  setTimeout(() => {
    imageLoad(url, () => {
      gallery.innerHTML = '<img class="view-image" src="' + url + '" alt="" />';
    });
    gallery.addEventListener('click', e => {
      gallery.parentNode.removeChild(gallery);
      e.stopPropagation();
    }, true);
  }, 250);
};