import './css/styles.css';
import { renderArticles } from './js/renderArticles';
import ArticlesApiService from './js/articles-api-service';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('.search-form');
const gallary = document.querySelector('.gallery');
const sentinel = document.querySelector('#sentinel');
const spinner = document.querySelector('.spinner');

const articlesApiService = new ArticlesApiService();
const lightbox = new SimpleLightbox('.gallery a', { captionDelay: 250 });

// IntersectionObserver  это класс втроенный в браузере. Реестрируем его в браузере. Параметр entries можна называть как угодно, обычно это точка вхождения. Это те элементы за которыми будем наблюдать
// По умолчанию root корневой элемент это viewport
const intersectionObserver = new IntersectionObserver(onEntry, {
  // здесь можно задать другой root
  root: null,
  // Чтобы observer ловил элемент раньше, пока он не дошел до нижней, сколько осталось до пересечения границы задаем rootMargin, картинки будут начинать подгружаться раньше
  rootMargin: '150px',
  // Сколько процентов таргета должно въехать в root и тогда реестрируем
  threshold: 1.0,
});

searchForm.addEventListener('submit', onSearch);

function onSearch(event) {
  event.preventDefault();

  // Забираємо термін для пошуку у set
  articlesApiService.query =
    event.currentTarget.elements.searchQuery.value.trim();
  if (articlesApiService.query === '') {
    return Notify.info(`Enter a word to search for images.`);
  }
  // При зміні пошуку та сабміті форми робимо пошук з 1 сторінки
  articlesApiService.resetPage();
  //очищуємо контейнер з картками при новому запиті і додаємо нові картки
  clearArticlesContainer();
  fetchArticles();
}

async function fetchArticles() {
  try {
    const data = await articlesApiService.fetchArticles();

    if (data.total === 0) {
      Notify.info(
        `Sorry, there are no images matching your search query: ${articlesApiService.query}. Please try again.`
      );
      return;
    }
    appendArticlesMarkup(data);
    articlesApiService.incrementPage();
    onPageScrolling();
    lightbox.refresh();

    if (gallary.children.length === data.totalHits) {
      Notify.info(`We're sorry, but you've reached the end of search results.`);
    } else {
      Notify.success(`Hooray! We found ${data.totalHits} images.`);
    }
    articlesApiService.setTotal(data.totalHits);
    if (articlesApiService.hasMoreArticles()) {
      // Викликаємо спостерігача, який буде слідкувати, коли елемент sentinel перетне межу і будуть довантажуватися картки
      // intersectionObserver.observe(sentinel);
      intersectionObserver.observe(sentinel);
    }
  } catch (error) {
    Notify.info(`Error`);
  }
}

function appendArticlesMarkup(hits) {
  gallary.insertAdjacentHTML('beforeend', renderArticles(hits));
}

function clearArticlesContainer() {
  gallary.innerHTML = '';
}

// Плавна прокрутка сторінки після запиту і рендера кожної наступної групи зображень
function onPageScrolling() {
  const { height: cardHeight } =
    gallary.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function onEntry(entries, observer) {
  // для каждого пересения
  entries.forEach(async entry => {
    // свойство isIntersecting это пересечение, у него булевое значение. Если элемент пересекает true, не пересекает false
    // Если isIntersecting true, то есть элемент пересекает, то выполняем код.
    if (entry.isIntersecting) {
      // ссылка на наш элемент sentinel, это пустой div в index.html, который стоит под галереей
      //свойство unobserve снимает слежение
      observer.unobserve(entry.target);
      articlesApiService.incrementPage();

      try {
        // з'являэться спінер
        spinnerPlay();
        const data = await articlesApiService.fetchArticles();
        appendArticlesMarkup(data);
        lightbox.refresh();
        // Здесть передыем элемент, за которым следим
        // Если следим за несколькими элементами, то несколько раз вызываем observer.observe(элемент);
        // вызываем observe
        observer.observe(sentinel);
      } catch (error) {
        observer.unobserve(entry.target);
        Notify.failure(error.message);
      } finally {
        spinnerStop();
      }
    }
  });
}

function spinnerPlay() {
  spinner.classList.remove('hidden');
}
function spinnerStop() {
  spinner.classList.add('hidden');
}
