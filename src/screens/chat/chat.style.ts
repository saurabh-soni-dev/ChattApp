import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  select: {
    paddingLeft: 8,
  },
  videoContainer: {
    position: 'relative',
    height: 156,
    width: 250,
  },
  videoElement: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 150,
    width: 242,
    borderRadius: 20,
    margin: 4,
  },
  chatHeaderTitleContainer: {
    flexDirection: 'row',
  },
  chatHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatHeaderStatus: {
    textTransform: 'capitalize',
  },
});
