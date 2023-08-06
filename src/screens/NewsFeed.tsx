import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useQuery, useRealm} from '@realm/react';
import Realm from 'realm';
import {News} from '../realm/News';
import {fetchNewsFeed} from '../utils/api';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  ListRenderItem,
  ListRenderItemInfo,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Swipeable} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/AntDesign';
import MaterailIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Alert} from 'react-native';
import FastImage from 'react-native-fast-image';

const {width, height} = Dimensions.get('window');

const NewsFeed: React.FC = () => {
  const realm = useRealm();
  const news = useQuery(News);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentNews, setCurrentNews] = useState<Array<News>>([]);
  let rowRefs = new Map();
  const listRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const randomNews = useRef<any>(null)
  const pinnedNews = useRef<any>([]);

  const randomIntFromInterval = (min: any, max: any) => {
    let randomArr = [];
    while (randomArr.length < 5) {
      let randomNum = Math.floor(Math.random() * (max - min + 1) + min);
      if (
        !pinnedNews.current
          ?.map((el:any) => el?._id + '')
          ?.includes(news[randomNum]?._id + '')
      ) {
        randomArr.push(news[randomNum]);
      }
    }
    return randomArr;
  };

  const fetchInitialandCurrentNewsFeed = useCallback(
    (page: number, toDelete: boolean = false) => {
      fetchNewsFeed(page)
        .then((res: Array<object>) => {
          if (toDelete) {
            realm.write(async () => {
              await realm.deleteAll();
            });
          }
          realm.write(async () => {
            res?.forEach(async el => {
              await realm.create('News', {
                _id: new Realm.BSON.ObjectID(),
                ...el,
              });
            });
          });
        })
        .catch(err => {});
    },
    [],
  );

  useEffect(() => {
    (async () => {
      //await fetchInitialandCurrentNewsFeed(1, true);
    })();
  }, []);

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      let resData = randomIntFromInterval(currentIndex + 10, news?.length - 1);
      setCurrentNews((prev: any) => {
        return [
          ...resData,
          ...prev
        ];
        // return [
        //   ...resData,
        //   ...prev?.filter(
        //     (el: any) =>
        //       !randomNews?.current?.map((e: any) => e?._id + '').includes(el?._id + ''),
        //   ),
        // ];
      });
      randomNews.current = resData;
    }, 10000);
  };

  useEffect(() => {
    startTimer();

    return () => {
      clearInterval(timerRef?.current)
    }
  }, []);

  useEffect(() => {
    if (currentNews?.length <= 0) {
      let newArr = news.slice(currentIndex, currentIndex + 10);
      setCurrentIndex(currentIndex + 10);
      setCurrentNews(newArr);
    }
  }, [news, currentNews]);

  const RenderNewsCard = useCallback(
    ({item, index}: ListRenderItemInfo<News>) => {
      const {_id, title, description, author, urlToImage} = item || {};
      return (
        <View key={_id + ''} style={styles.cardCont}>
          <View
            style={{
              flexDirection: 'row-reverse',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            {pinnedNews.current?.find((el:any) => el?._id + '' === _id + '') && (
              <Pressable
                onPress={() => {
                  pinnedNews.current = pinnedNews.current?.filter((el: any) => el?._id + '' !== _id + '')
                }}
                style={{justifyContent: 'center', alignItems: 'center'}}>
                <Icon
                  name="pushpin"
                  size={15}
                  color="#900"
                  style={{marginHorizontal: 5}}
                />
              </Pressable>
            )}
            <Text style={styles.titleText}>{title}</Text>
            {urlToImage && (
              <FastImage
                source={{uri: urlToImage}}
                style={{width: 25, height: 25}}
              />
            )}
          </View>
          <Text numberOfLines={2} ellipsizeMode="tail" style={styles.descText}>
            {description}
          </Text>
        </View>
      );
    },
    [currentNews, pinnedNews],
  );

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<string | number>,
    xVal: Animated.AnimatedInterpolation<string | number>,
  ) => {
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingLeft: 15,
        }}>
        <Icon name="pushpin" size={30} color="#555" />
      </View>
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<string | number>,
    xVal: Animated.AnimatedInterpolation<string | number>,
  ) => {
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingRight: 15,
        }}>
        <Icon name="delete" size={30} color="#900" />
      </View>
    );
  };

  const onSwipeActions = (e: 'left' | 'right', item: any) => {
    switch (e) {
      case 'left':
        if (
          pinnedNews.current.find((el:any) => el?._id + '' === item?._id + '') === undefined
        ) {
          pinnedNews.current = [...pinnedNews.current, item];
          setCurrentNews(prev =>
            prev.filter(el => el?._id + '' !== item?._id + ''),
          );
        }
        break;
      case 'right':
        try {
          pinnedNews.current = pinnedNews.current?.filter((el: any) => el?._id + '' !== item?._id + '');
          randomNews.current = randomNews?.current?.filter(
            (el: any) => el?._id + '' !== item?._id + '',
          );
          setCurrentNews(prev =>
            prev?.filter(el => el?._id + '' !== item?._id + ''),
          );
          rowRefs.delete(item?._id);
          realm.write(async () => {
            await realm.delete(item);
          });
        } catch (error) {
          console.log(error)
        }
        break;
      default:
        break;
    }
  };

  const onLoadNext = () => {
    let newArr = news.slice(currentIndex, currentIndex + 10);
    setCurrentNews(newArr);
    setCurrentIndex(currentIndex + 10);
    clearInterval(timerRef?.current);
    listRef?.current?.scrollToOffset({animated: true, offset: 0});
    if (
      Math.floor(news?.length / 10) === Math.floor((currentIndex + 10) / 10)
    ) {
      fetchInitialandCurrentNewsFeed(2, false);
    }
    startTimer();
  };

  return (
    <SafeAreaView style={styles.mainCont}>
      <Text style={[styles.headerText, {marginVertical: 5}]}>
        News Headlines
      </Text>
      {news && news?.length > 0 && (
        <FlatList
          ref={listRef}
          data={currentNews}
          ListHeaderComponent={() => {
            return pinnedNews.current?.length > 0 ? (
              <View>
                {pinnedNews.current?.map((item:any, index:any) => {
                  let props = {item, index} as any;
                  return (
                    <Swipeable
                      key={index + 'Header'}
                      ref={ref => {
                        rowRefs.set(props?.item?._id, ref);
                      }}
                      renderLeftActions={renderLeftActions}
                      renderRightActions={renderRightActions}
                      onSwipeableOpen={e => {
                        [...rowRefs.entries()].forEach(([key, ref]) => {
                          if (key !== props?.item?._id && ref) ref.close();
                        });
                        onSwipeActions(e, props?.item);
                      }}>
                      <RenderNewsCard {...props} />
                    </Swipeable>
                  );
                })}
              </View>
            ) : (
              <></>
            );
          }}
          renderItem={props => {
            let ref: any;
            return (
              <Swipeable
                ref={ref => {
                  rowRefs.set(props?.item?._id, ref);
                }}
                renderLeftActions={renderLeftActions}
                renderRightActions={renderRightActions}
                onSwipeableOpen={e => {
                  [...rowRefs.entries()].forEach(([key, ref]) => {
                    if (key !== props?.item?._id && ref) ref.close();
                  });
                  onSwipeActions(e, props?.item);
                }}>
                <RenderNewsCard {...props} />
              </Swipeable>
            );
          }}
        />
      )}
      <TouchableOpacity style={styles.floatingButton} onPress={onLoadNext}>
        <MaterailIcon
          name="page-next-outline"
          size={30}
          style={{color: '#900'}}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainCont: {
    flex: 1,
    width: '100%',
  },
  cardCont: {
    flex: 1,
    marginHorizontal: 15,
    marginVertical: 5,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#171717',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    padding: 10,
  },
  headerText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
  },
  titleText: {
    flex: 1,
    marginLeft: 10,
    fontWeight: '600',
  },
  descText: {
    fontSize: 12,
    marginTop: 7,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'white',
    padding: 10,
    paddingRight: 12,
    borderRadius: 100,
    shadowColor: '#171717',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2,
  },
});

export default NewsFeed;
