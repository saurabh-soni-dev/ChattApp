import {CometChat} from '@cometchat/chat-sdk-react-native';
import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Context from '../../i18n/Context';
import {styles} from './home.style';
import screenName from '../../navigation/screenName';

const Home = () => {
  const navigation = useNavigation();
  const {setSelectedConversation} = useContext(Context);
  const [keyword, setKeyword] = useState('');
  const [selectedType, setSelectedType] = useState(0);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (selectedType === 0) {
      searchUsers();
    } else {
      searchGroups();
    }
  }, [CometChat, selectedType, keyword]);

  const searchUsers = () => {
    if (CometChat) {
      const limit = 30;
      const usersRequestBuilder = new CometChat.UsersRequestBuilder().setLimit(
        limit,
      );
      const usersRequest = keyword
        ? usersRequestBuilder.setSearchKeyword(keyword).build()
        : usersRequestBuilder.build();
      usersRequest.fetchNext().then(
        (userList: any) => {
          setData(() => userList);
        },
        error => {
          console.log('err:', error);
        },
      );
    }
  };

  const searchGroups = () => {
    const limit = 30;
    const groupRequestBuilder = new CometChat.GroupsRequestBuilder().setLimit(
      limit,
    );
    const groupsRequest = keyword
      ? groupRequestBuilder.setSearchKeyword(keyword).build()
      : groupRequestBuilder.build();
    groupsRequest.fetchNext().then((groupList: any) => {
      setData(() => groupList);
    });
  };

  const onKeywordChanged = (keyword: any) => {
    setKeyword(() => keyword);
  };

  const updateSelectedType = (selectedType: any) => () => {
    setSelectedType(() => selectedType);
  };

  const joinGroup = (item: any) => {
    if (item && item.guid && !item.hasJoined) {
      const GUID = item.guid;
      const password: any = '';
      const groupType: any = CometChat.GROUP_TYPE.PUBLIC;

      CometChat.joinGroup(GUID, groupType, password).then(
        group => {},
        error => {},
      );
    }
  };

  const selectItem = (item: any) => () => {
    console.log('item', item);
    // if item is a group. Join the group if the user has not joined before.
    if (item && item.guid && !item.hasJoined) {
      joinGroup(item);
    }
    //
    setSelectedConversation({...item, contactType: selectedType});
    navigation.navigate(screenName.chat);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          autoCapitalize="none"
          onChangeText={onKeywordChanged}
          placeholder="Search..."
          style={styles.input}
        />
      </View>
      <View style={styles.searchActionContainer}>
        <TouchableOpacity
          style={[
            styles.searchActionBtn,
            styles.searchLeftActionBtn,
            selectedType === 0 && styles.searchActionBtnActive,
          ]}
          onPress={updateSelectedType(0)}>
          <Text
            style={[
              styles.searchActionLabel,
              selectedType === 0 && styles.searchActionLabelActive,
            ]}>
            User
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.searchActionBtn,
            styles.searchRightActionBtn,
            selectedType === 1 && styles.searchActionBtnActive,
          ]}
          onPress={updateSelectedType(1)}>
          <Text
            style={[
              styles.searchActionLabel,
              selectedType === 1 && styles.searchActionLabelActive,
            ]}>
            Group
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.list}>
        <FlatList
          data={data}
          keyExtractor={(item, index) => {
            return `${index}`;
          }}
          renderItem={({item, index}) => {
            return (
              <TouchableOpacity
                style={styles.listItem}
                onPress={selectItem(item)}>
                <Image
                  style={styles.listItemImage}
                  source={{uri: 'https://picsum.photos/200/300'}}
                  resizeMode="center"
                />
                <Text style={styles.listItemLabel}>{item.name} </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: item?.status == 'offline' ? 'red' : 'green',
                    fontWeight: '600',
                  }}>
                  {item?.status}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );
};

export default Home;
