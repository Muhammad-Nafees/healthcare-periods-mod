import React, {useEffect, useState} from 'react';
import {StyleSheet, View, FlatList, Text} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {themeColors} from '../theme/colors';
import {size} from '../theme/fontStyle';
import {fonts} from '../theme/fonts';
import {
  getNotifications,
  handleNotificationSeen,
} from '../services/notificationService';
import {limit} from '../../config/variables';
import {useSelector} from 'react-redux';
import {user} from '../store/selectors';
import {ActivityIndicator} from 'react-native-paper';
import moment from 'moment';

const Notifications = () => {
  const userData: any = useSelector(user);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadNotifications = async (userId: string) => {
    if (!hasMore) return;
    getNotifications(
      userId,
      page * limit,
      () => setLoading(true),
      (successData: any) => {
        setNotifications((prev: any) => [...prev, ...successData]);
        setHasMore(successData.length === limit);
        setPage(prev => prev + 1);
        setLoading(false);
      },
      (error: any) => {
        console.log('Error while fetching notifications list', error);
        setLoading(false);
      },
    );
  };

  const updateNotificationSeen = (notificationId: string) => {
    handleNotificationSeen(
      notificationId,
      () => {
        console.log('Updating notification...');
      },
      (successData: any) => {
        setNotifications((prev: any) => {
          // Create a copy of the previous notifications
          const updatedNotifications = prev.map((notification: any) =>
            notification.id === notificationId
              ? {...notification, is_seen: true} // Update the is_seen property
              : notification,
          );
          return updatedNotifications;
        });
      },
      (error: any) => {
        console.log('Error while updating notification:', error.message);
      },
    );
  };

  useEffect(() => {
    if (userData?.id) {
      loadNotifications(userData?.id);
    }
  }, [userData?.id]);

  const renderFooter = () => {
    return hasMore && loading ? (
      <ActivityIndicator size="small" color={themeColors.primary} />
    ) : null;
  };

  const handleLoadMore = () => {
    if (!loading && userData?.id) {
      loadNotifications(userData?.id);
    }
  };

  const renderItem = ({item}: any) => (
    <View style={styles.cardContainer}>
      <View
        style={[
          styles.dot,
          {
            backgroundColor: item.is_seen
              ? themeColors.black
              : themeColors.primary,
          },
        ]}></View>
      <View style={{flex: 1}}>
        <View style={styles.titleHeader}>
          <Text
            style={[styles.title, {fontWeight: item.is_seen ? '100' : '900'}]}>
            {item.title}
          </Text>
          <Text
            style={[styles.time, {fontWeight: item.is_seen ? '100' : '900'}]}>
            {moment(item.created_at).format('DD-MM-YY | hh:mm A')}
          </Text>
        </View>
        <View>
          <Text
            style={[styles.desc, {fontWeight: item.is_seen ? '100' : '900'}]}>
            {item.body}
          </Text>
        </View>
        {!item.is_seen && (
          <TouchableOpacity onPress={() => updateNotificationSeen(item.id)}>
            <Text style={styles.mark}>Mark as read</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{paddingBottom: 10}}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.lightGray,
    padding: 15,
  },
  cardContainer: {
    backgroundColor: themeColors.white,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dot: {
    backgroundColor: themeColors.primary,
    height: 10,
    width: 10,
    borderRadius: 50,
    marginRight: 5,
  },
  titleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: size.md,
    fontFamily: fonts.OpenSansRegular,
    fontWeight: '900',
    color: themeColors.black,
  },
  time: {
    fontSize: size.s,
    fontFamily: fonts.OpenSansRegular,
    fontWeight: '900',
    color: themeColors.black,
  },
  desc: {
    fontSize: size.s,
    fontFamily: fonts.OpenSansRegular,
    fontWeight: '900',
    marginTop: 3,
    color: themeColors.black,
  },
  mark: {
    fontSize: size.sl,
    fontFamily: fonts.OpenSansRegular,
    fontWeight: '900',
    color: themeColors.primary,
    alignSelf: 'flex-end',
  },
});
