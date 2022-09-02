import './css/styles.css';
import RequestServiceImg from './requestImg';
import createImgGallery from './creategallery';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const gallery = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const requireImages = new RequestServiceImg();
const refs = {
  searchForm: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};
const per_page = 40;
let page = 1;

refs.loadMoreBtn.style.display = 'none';

refs.searchForm.addEventListener('submit', onSearchBtn);
refs.loadMoreBtn.addEventListener('click', onBtnLoadMoreClick);

let totalHits = 0;

async function onSearchBtn(e) {
  e.preventDefault();

  clearGallery();

  const searchValue = e.currentTarget.elements.searchQuery.value.trim();

  if (!searchValue) {
    return;
  }
  requireImages.query = searchValue;
  requireImages.resetPage();

  const images = await requireImages.getImage();

  if (images.hits.length === 0) {
    Notify.failure('Please, write the correct query');
    return;
  }

  totalHits = images.totalHits;
  Notify.success(`Hooray! We found ${totalHits} images.`);

  totalHits -= images.hits.length;

  const renderCard = createImgGallery(images.hits);
  addToHTML(renderCard);
  toggleLoadMoreBtn(totalHits);

  gallery.refresh();
}
async function onBtnLoadMoreClick() {
  const images = await requireImages.getImage();
  const renderCard = createImgGallery(images.hits);
  //page += 1;
  totalHits -= images.hits.length;
  // const totalPage = totalHits / per_page;

  addToHTML(renderCard);

  if (totalHits === 0 || totalHits < 0) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    return;
  }
  toggleLoadMoreBtn(totalHits);

  smoothPageScrolling();
  gallery.refresh();
}

function clearGallery() {
  refs.gallery.innerHTML = '';
}
function addToHTML(renderCard) {
  refs.gallery.insertAdjacentHTML('beforeend', renderCard);
}
function toggleLoadMoreBtn(value) {
  if (value === 0 || value < 0) {
    refs.loadMoreBtn.style.display = 'none';
    //Notify.info("We're sorry, but you've reached the end of search results.");
  } else if (value < per_page) {
    refs.loadMoreBtn.style.display = 'none';
    //Notify.info("We're sorry, but you've reached the end of search results.");
  } else {
    refs.loadMoreBtn.style.display = 'block';
  }
}
function smoothPageScrolling() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
