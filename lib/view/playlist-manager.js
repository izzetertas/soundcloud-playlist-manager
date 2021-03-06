// View configuration for Playlist Manager

'use strict';

var el         = require('../util/create-element')
  , manager    = require('../playlist-manager')
  , form       = require('./playlist-form')
  , playlist   = require('./playlist')
  , managerDom = document.querySelector('section.playlist-manager')
  , list       = managerDom.querySelector('ul')

  , getPlaylist, selected, noPlaylist, plParent, update, redraw;

noPlaylist = document.querySelector('section.playlist');
plParent = noPlaylist.parentNode;

// Setup "Add Playlist" button
managerDom.querySelector('input.add-playlist').onclick = form.partial(null);

// Setup Playlist list
// Memoize each playlist list item (create once, reuse)
getPlaylist = function (playlist) {
  var li = el('li', el('a', { onclick: manager.select.bind(manager, playlist) },
    playlist.toDOM()));

  playlist.on('play', function () {
    li.classList.add('playing');
  });
  playlist.on('stop', function () {
    li.classList.remove('playing');
  });
  return li;
}.memoize();

// Redraws playlists list view
redraw = function () {
  var length = list.childNodes.length;
  manager.map(getPlaylist).forEach(list.appendChild, list);
  while (manager.length < list.childNodes.length) {
    list.removeChild(list.firstChild);
  }
};
redraw();

manager.on('update', function (e) {
  // Redraw playlist on each manager update
  redraw();

  if (e.action === 'insert') {
    // If new Playlist was added select it
    manager.select(e.target);
  }
});

manager.on('select', function (e) {
  if (e.target) {
    plParent.replaceChild(playlist(e.target),
      selected ? playlist(selected) : noPlaylist);
    if (selected) {
      getPlaylist(selected).classList.remove('selected');
    }
    selected = e.target;
    getPlaylist(selected).classList.add('selected');
  } else {
    plParent.replaceChild(noPlaylist, playlist(selected));
    getPlaylist(selected).classList.remove('selected');
    selected = null;
  }
});
