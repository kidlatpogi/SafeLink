import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function TermsPrivacy({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {/* Terms of Service */}
          <Text style={styles.title}>Terms of Service</Text>
          <Text style={styles.updated}>Last Updated: September 16, 2025</Text>

          <Text style={styles.sectionTitle}>1. Purpose of the App</Text>
          <Text style={styles.paragraph}>
            The Disaster Preparedness and Family Tracker App (“the App”) is
            designed to provide disaster alerts from trusted government agencies
            such as PAGASA, PHIVOLCS, NDRRMC, and DOST. It allows family members
            to check in with safety statuses, assists users in locating
            evacuation centers, and enables LGUs to send announcements. The App
            is intended as a supplementary tool and must not replace official
            advisories or emergency services.
          </Text>

          <Text style={styles.sectionTitle}>2. User Responsibilities</Text>
          <Text style={styles.paragraph}>
            By using this App, you agree to provide accurate information,
            safeguard your login credentials, and refrain from unlawful use in
            accordance with the Cybercrime Prevention Act of 2012 (RA 10175).
            Availability may be affected during disasters due to reliance on
            internet and mobile networks.
          </Text>

          <Text style={styles.sectionTitle}>3. Limitations of Liability</Text>
          <Text style={styles.paragraph}>
            The App does not guarantee 100% accuracy of alerts or evacuation
            data. The developers are not liable for damages, losses, or injuries
            arising from reliance on the App. Use is at your own risk. Always
            follow official government instructions.
          </Text>

          <Text style={styles.sectionTitle}>4. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            All logos, designs, and software are property of the developers
            unless otherwise credited. You may not copy, modify, or distribute
            without written consent.
          </Text>

          <Text style={styles.sectionTitle}>5. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms are governed by the laws of the Republic of the
            Philippines, including the Civil Code and the Philippine Disaster
            Risk Reduction and Management Act of 2010 (RA 10121).
          </Text>

          {/* Privacy Policy */}
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.updated}>Last Updated: September 16, 2025</Text>

          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.paragraph}>
            We may collect personal details (name, email, mobile number), family
            group data, location data, emergency status updates, and device
            information for improving services.
          </Text>

          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            Information is used to send real-time alerts, enable family safety
            tracking, help LGUs send announcements, and improve the App’s
            features.
          </Text>

          <Text style={styles.sectionTitle}>3. Data Sharing</Text>
          <Text style={styles.paragraph}>
            Data may be shared with government agencies (e.g., NDRRMC, LGUs) for
            disaster response. We do not sell or trade personal data. Disclosure
            may occur if required by law or government order.
          </Text>

          <Text style={styles.sectionTitle}>4. Data Protection</Text>
          <Text style={styles.paragraph}>
            We implement encryption, authentication, and secure servers. Only
            authorized personnel have access. Users may request access,
            correction, or deletion of their data under the Data Privacy Act of
            2012 (RA 10173).
          </Text>

          <Text style={styles.sectionTitle}>5. Retention of Data</Text>
          <Text style={styles.paragraph}>
            Data is kept only as long as necessary for disaster preparedness.
            Users may request account deletion anytime.
          </Text>

          <Text style={styles.sectionTitle}>6. Children’s Privacy</Text>
          <Text style={styles.paragraph}>
            The App is intended for family use. Parents/guardians are
            responsible for managing accounts of users under 18.
          </Text>

          <Text style={styles.sectionTitle}>7. Your Rights</Text>
          <Text style={styles.paragraph}>
            Under RA 10173, you have the right to be informed, access, object,
            request correction or deletion, and file complaints with the
            National Privacy Commission.
          </Text>

          <Text style={styles.sectionTitle}>8. Contact Us</Text>
          <View style={{ marginTop: 6 }}>
            <Text style={styles.paragraph}>
              📧 Email: [Insert Email Address]
            </Text>
            <Text style={styles.paragraph}>
              📞 Phone: [Insert Contact Number]
            </Text>
            <Text style={styles.paragraph}>
              🏢 Address: [Insert Office Address]
            </Text>
          </View>
        </ScrollView>

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeBtnText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { padding: 20, paddingBottom: 80 },
  title: { fontSize: 22, fontWeight: "bold", marginVertical: 10 },
  updated: { fontSize: 12, color: "#888", marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginTop: 12 },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    textAlign: "justify",
  },
  closeBtn: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#eb4b3f",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  closeBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});