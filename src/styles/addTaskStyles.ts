import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Export the styles so they can be imported in the main component
export const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor will be applied dynamically
    },
    innerContainer: {
        flex: 1,
        paddingHorizontal: 5,
        paddingTop: 10,
    },
    instructionText: {
        // color will be applied dynamically
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 10,
        fontWeight: 'bold',
    },
    content: {
        paddingBottom: 80,
    },
    taskContainer: {
        borderRadius: 10,
        marginBottom: 15,
        overflow: 'hidden',
        width: width - 10,
    },
    weeklyTaskContainer: {
        backgroundColor: theme.mode === 'dark' ? 'rgba(180, 0, 0, 0.2)' : 'rgba(255, 100, 100, 0.15)',
        borderWidth: 1,
        borderColor: theme.mode === 'dark' ? 'rgba(255, 0, 0, 0.3)' : 'rgba(255, 100, 100, 0.3)',
    },
    dailyTaskContainer: {
        backgroundColor: theme.mode === 'dark' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 100, 100, 0.1)',
        borderWidth: 1,
        borderColor: theme.mode === 'dark' ? 'rgba(255, 0, 0, 0.2)' : 'rgba(255, 100, 100, 0.2)',
    },
    completedTaskWeekly: {
        backgroundColor: theme.mode === 'dark' ? 'rgba(0, 120, 0, 0.3)' : 'rgba(0, 180, 0, 0.15)',
        borderWidth: 1,
        borderColor: theme.mode === 'dark' ? 'rgba(0, 180, 0, 0.4)' : 'rgba(0, 180, 0, 0.3)',
    },
    completedTaskDaily: {
        backgroundColor: theme.mode === 'dark' ? 'rgba(0, 150, 0, 0.2)' : 'rgba(0, 180, 0, 0.1)',
        borderWidth: 1,
        borderColor: theme.mode === 'dark' ? 'rgba(0, 180, 0, 0.3)' : 'rgba(0, 180, 0, 0.2)',
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.text,
    },
    photoButton: {
        backgroundColor: theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    photoButtonText: {
        color: theme.text,
        fontSize: 12,
    },
    taskContent: {
        padding: 15,
    },
    taskInput: {
        fontSize: 14,
        color: theme.text,
        textAlign: 'left',
        paddingVertical: 5,
        minHeight: 50,
    },
    imageContainer: {
        marginTop: 10,
        alignItems: 'center',
    },
    taskImage: {
        width: width - 60,
        height: width - 60,
        borderRadius: 8,
        marginTop: 10,
    },
    showProofButton: {
        backgroundColor: theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        alignSelf: 'center',
        marginTop: 10,
    },
    showProofText: {
        color: theme.text,
        fontSize: 12,
        textAlign: 'center',
    },
    addTaskButton: {
        backgroundColor: theme.accent,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 15,
    },
    addTaskText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderTopWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.background,
    },
    icon: {
        fontSize: 24,
        color: theme.text,
    },
    homeButton: {
        backgroundColor: theme.accent,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    homeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    taskTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteButton: {
        padding: 5,
        marginRight: 5,
    },
    deleteButtonText: {
        fontSize: 16,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    taskOptionContainer: {
        width: '100%',
        marginBottom: 25,
        borderRadius: 10,
        padding: 5,
    },
    taskOptionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    taskOptionText: {
        fontSize: 14,
        marginBottom: 15,
        textAlign: 'center',
    },
    taskOptionInput: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        width: '100%',
        height: 50,
    },
    taskDetailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    taskDetailItem: {
        flex: 1,
        marginHorizontal: 5,
    },
    taskDetailLabel: {
        fontSize: 12,
        marginBottom: 5,
    },
    taskDetailInput: {
        padding: 12,
        borderRadius: 5,
        height: 45,
        justifyContent: 'center',
    },
    taskOptionButton: {
        backgroundColor: theme.accent,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    taskOptionButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    modalDivider: {
        height: 1,
        width: '100%',
        marginVertical: 15,
    },
    cancelButton: {
        marginTop: 15,
        padding: 12,
        width: '100%',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 14,
    },
    categoryButton: {
        width: '100%',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        alignItems: 'center',
    },
    categoryButtonText: {
        fontSize: 16,
    },
});