export function renderArticles({ hits }) {
  return hits
    .map(hit => {
      return `<div class="photo-card">
        <a class="gallary-link" href=${hit.largeImageURL}>
      <img class ="gallary-image"src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" /></a>
      <div class="info">
        <p class="info-item">
          <b>Likes: </b></br>${hit.likes}
        </p>
        <p class="info-item">
          <b>Views: </b></br>${hit.views}
        </p>
        <p class="info-item">
          <b>Comments: </b></br>${hit.comments}
        </p>
        <p class="info-item">
          <b>Downloads: </b></br>${hit.downloads}
        </p>
      </div>
    </div>
      `;
    })
    .join('');
}
