import {API_KEY} from '@env';
import axios from 'axios';

var API_URL = 'https://newsapi.org/v2/everything?q=india&apiKey=';

export const fetchNewsFeed = async (currPage: number) => {
  try {
    const {data} = await axios.get(
      `${API_URL}${API_KEY}&page=${currPage}&sortBy=publishedAt`,
    );
    const {articles = []} = data || {};
    return articles;
  } catch (error) {
    return [];
  }
};
