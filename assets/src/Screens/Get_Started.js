import { Text, TouchableOpacity, StyleSheet, Image, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function Get_Started({ navigation }) {
    return (

        // Gradient background
        <LinearGradient
            colors={["#eb4b3f", "#f0945b"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.container}
        >

        {/* Middle content */}
            <View style={styles.centerContent}>
                <Image
                    source={require("../Images/SafeLink_LOGO.png")}
                    style={styles.image}
                    resizeMode="contain"
                />
                <Text style={styles.text}>Safe<Text style={styles.linkText}>Link</Text></Text>
                <Text style={styles.subtext}>When Preparedness Meets Protection</Text>
            </View>

        {/* Button fixed at bottom */}
            <View style={styles.bottomContent}>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CreateAccount')}>
                    <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>
            </View>
        
        </LinearGradient>
    );
}

// hgihiwalay ko pa ba tong CSS? ilang lines lang naman MWAHAHAH
// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    // Center the logo + texts
    centerContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    //   Logo image
    image: {
        width: 200,
        height: 200,
    },

    //   Main text
    text: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#1A1A1A",
        marginTop: 20,
        fontFamily: "CanvaSans-Regular",
    },

    //   Subtext
    subtext: {
        fontSize: 18,
        color: "#fff",
        marginTop: 10,
        maxWidth: "50%",
        textAlign: "center",
        fontFamily: "CanvaSans-Regular",
    },

    // Bottom section for button
    bottomContent: {
        alignItems: "center",
        paddingBottom: 40,
    },

    //   Button styles
    button: {
        backgroundColor: "#fff",
        paddingVertical: 20,
        paddingHorizontal: 100,
        borderRadius: 17,
    },

    //   Button text
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#eb4b3f",
        fontFamily: "CanvaSans-Regular",
    },

    linkText: {
        color: "#E82222",
        fontFamily: "CanvaSans-Regular",
    },
});