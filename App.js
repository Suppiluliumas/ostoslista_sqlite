import React, { useState, useEffect } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Button,
  Image,
} from "react-native";
import { AsyncStorage } from "@react-native-async-storage/async-storage";
import * as SQLite from "expo-sqlite";

export default function App() {
  const [purchase, setPurchase] = useState("");
  const [amount, setAmount] = useState("");
  const [items, setItems] = useState([]);
  const db = SQLite.openDatabase("shoppinglistdb.db");

  useEffect(() => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "create table if not exists shoppinglist (id integer primary key not null, amount int, purchase text);"
        );
      },
      () => console.error("Error when creating DB"),
      updateList
    );
  }, []);

  const updateList = () => {
    db.transaction(
      (tx) => {
        tx.executeSql("select * from shoppinglist;", [], (_, { rows }) =>
          setItems(rows._array)
        );
      },
      null,
      null
    );
  };

  const saveItem = () => {
    if (!purchase || !amount) {
      alert("Please fill in both Purchase and Amount fields before saving.");
      return;
    }

    db.transaction(
      (tx) => {
        tx.executeSql(
          "insert into shoppinglist (amount, purchase) values (?, ?);",
          [parseInt(amount), purchase]
        );
      },
      null,
      updateList
    );
  };
  const deleteItem = (id) => {
    db.transaction(
      (tx) => tx.executeSql("delete from shoppinglist where id = ?;", [id]),
      null,
      updateList
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ostoslista</Text>
      <TextInput
        style={styles.input}
        placeholder="Purchase"
        onChangeText={(text) => setPurchase(text)}
        value={purchase}
      />

      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="numeric"
        onChangeText={(text) => setAmount(text)}
        value={amount}
      />
      <Button onPress={saveItem} title="Save" />

      <FlatList
        data={items}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemListText}>
              {item.purchase}, {item.amount} 
            </Text>
            <Text
              style={styles.bought }
              onPress={() => deleteItem(item.id)}
            >
              Bought
            </Text>
          </View>
        )}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 200,
  },
  item: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
    
  },
  itemListText: {
    fontSize:20,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },input: {
    fontSize: 18,
    height: 50, // Adjust the height as needed
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: 300, // Adjust the width as needed
  },
  bought: {
    color:"blue",
    marginLeft: 10,
  }
});
