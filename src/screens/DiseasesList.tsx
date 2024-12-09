import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {themeColors} from '../theme/colors';
import {fonts} from '../theme/fonts';
import {size} from '../theme/fontStyle';
import {getDiseaseListByType} from '../services/diseases';
import {limit} from '../../config/variables';
import {SCREENS} from '../constants/screens';

type Props = {
  navigation?: NativeStackNavigationProp<any>;
  route?: {
    params: {
      listType?: string;
    };
  };
};

const DiseasesList = ({navigation, route}: Props) => {
  const {listType} = route?.params || {};
  const [loading, setLoading] = useState(true);
  const [diseases, setDiseases] = useState<any>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  console.log('~has more', hasMore);
  console.log('~page', page);
  console.log('~diseases', diseases);
  // console.log('~has more', hasMore);

  const loadDiseases = async (listType: string) => {
    if (!hasMore) return;

    getDiseaseListByType(
      listType,
      page * limit,
      () => setLoading(true),
      (successData: any) => {
        console.log('~ List-Type', listType), console.log('data', successData);
        if (diseases && hasMore) {
          setDiseases((prev: any) => [...prev, ...successData]);
        }
        setHasMore(successData.length === limit);
        setPage(prev => prev + 1);
        setLoading(false);
      },
      (error: any) => {
        console.log('Error while fetching diseases list', error);
        setLoading(false);
      },
    );
  };

  useEffect(() => {
    if (listType) {
      loadDiseases(listType);
    }
  }, [listType]);

  const renderFooter = () => {
    return hasMore && loading ? (
      <ActivityIndicator size="small" color={themeColors.primary} />
    ) : null;
  };
  console.log('~diseases after execution', diseases);

  const handleLoadMore = () => {
    if (!loading && listType) {
      loadDiseases(listType);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.listTypeText}>{listType}</Text>
        <View style={styles.horizontalLine}></View>
      </View>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={themeColors.primary} size={'large'} />
        </View>
      ) : diseases?.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No record found</Text>
        </View>
      ) : (
        <FlatList
          data={diseases}
          keyExtractor={item => item?.id?.toString()}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() =>
                navigation?.navigate('DiseasesDetails', {id: item?.id})
              }>
              <Text style={styles.itemText}>{item?.condition_name}</Text>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
};

export default DiseasesList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.lightGray,
    padding: 15,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: size.lg,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.darkGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  listTypeText: {
    backgroundColor: themeColors.primary,
    paddingHorizontal: 15,
    paddingVertical: 5,
    fontFamily: fonts.OpenSansBold,
    fontSize: size.xlg,
    color: themeColors.white,
  },
  horizontalLine: {
    borderBottomWidth: 2,
    borderColor: themeColors.primary,
    flex: 1,
  },
  itemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: themeColors.darkGray,
    paddingVertical: 10,
  },
  itemText: {
    color: themeColors.darkGray,
    fontSize: size.md,
    fontFamily: fonts.OpenSansBold,
  },
});
