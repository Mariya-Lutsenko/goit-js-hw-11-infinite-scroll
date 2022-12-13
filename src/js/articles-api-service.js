import axios from 'axios';

const API_KEY = '31909701-b05a4a73718479a7bf524b9e0';
const PARAMETERS =
  'per_page=40&orientation=horizontal&image_type=photo&safesearch=true';
axios.defaults.baseURL = 'https://pixabay.com/api';

export default class ArticlesApiService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.perPage = 40;
    this.TotalArticles = 0;
  }
  async fetchArticles() {
    try {
      const response = await axios.get(
        `/?key=${API_KEY}&q=${this.searchQuery}&page=${this.page}&${PARAMETERS}`
      );
      const data = await response.data;
      console.log(data);
      this.incrementPage();
      return data;
    } catch {
      throw new Error(response.status);
    }
  }

  //   Після запиту збільшуємо сторінку на 1
  incrementPage() {
    this.page += 1;
  }
  // метод, який збрасує сторінку на 1
  resetPage() {
    this.page = 1;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }

  setTotal(newTotal) {
    this.totalArticles = newTotal;
  }
  hasMoreArticles() {
    return this.page < Math.ceil(this.totalArticles / this.perPage);
  }
}
