import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {themeColors} from '../../../theme/colors';
import {size} from '../../../theme/fontStyle';
import {fonts} from '../../../theme/fonts';

const Advertisement: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.title}>Medicine</Text>
        <Text style={styles.desc}>
          Get your medicine at home by online order...
        </Text>
        <Text style={styles.orderBtn}>Order Now</Text>
      </View>
      <Image
        style={styles.image}
        source={require('../../../../assets/medicines.jpeg')}
      />
    </View>
  );
};

export default Advertisement;

const styles = StyleSheet.create({
  container: {
    backgroundColor: themeColors.primary,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    // marginVertical: 20,
    marginBottom: 10,
    height: 175,
  },
  info: {
    flex: 0.75,
    marginRight: 8,
  },
  title: {
    color: themeColors.white,
    fontSize: size.xlg,
    fontFamily: fonts.QuincyCFMedium,
    marginBottom: 5,
  },
  desc: {
    color: themeColors.white,
    fontSize: size.sl,
    fontFamily: fonts.OpenSansRegular,
  },
  orderBtn: {
    backgroundColor: themeColors.white,
    width: 100,
    textAlign: 'center',
    marginTop: 15,
    fontSize: size.s,
    color: themeColors.black,
    padding: 5,
    fontFamily: fonts.OpenSansRegular,
  },
  image: {
    flex: 1,
    width: '100%',
    // height: 140,
    height: '100%',
    borderRadius: 10,
  },
});
