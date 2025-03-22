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
        backgroundColor: 'rgba(180, 0, 0, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 0, 0, 0.3)',
        },
        dailyTaskContainer: {
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 0, 0, 0.2)',
        },
        completedTaskWeekly: {
        backgroundColor: 'rgba(0, 120, 0, 0.3)',
        borderWidth: 1,
        borderColor: 'rgba(0, 180, 0, 0.4)',
        },
        completedTaskDaily: {
        backgroundColor: 'rgba(0, 150, 0, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(0, 180, 0, 0.3)',
        },
        taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        },
        taskTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        },
        photoButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        },
        photoButtonText: {
        color: 'white',
        fontSize: 12,
        },
        taskContent: {
        padding: 15,
        },
        taskInput: {
        fontSize: 14,
        color: 'white',
        textAlign: 'center',
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
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        alignSelf: 'center',
        marginTop: 10,
        },
        showProofText: {
        color: 'white',
        fontSize: 12,
        textAlign: 'center',
        },
        addTaskButton: {
        backgroundColor: '#444',
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
        borderColor: 'gray',
        backgroundColor: 'black',
        },
        icon: {
        fontSize: 24,
        color: 'white',
        },
        homeButton: {
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        },
        modalContent: {
        backgroundColor: '#222',
        width: '100%',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        maxHeight: '80%',
        },
        modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 20,
        textAlign: 'center',
        },
        taskOptionContainer: {
        width: '100%',
        marginBottom: 15,
        backgroundColor: '#333',
        borderRadius: 10,
        padding: 15,
        },
        taskOptionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
        },
        taskOptionText: {
        color: '#ddd',
        fontSize: 14,
        marginBottom: 15,
        textAlign: 'center',
        },
        taskOptionInput: {
        backgroundColor: '#444',
        padding: 12,
        borderRadius: 8,
        color: 'white',
        marginBottom: 15,
        width: '100%',
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
        color: '#ddd',
        fontSize: 12,
        marginBottom: 5,
        },
        taskDetailInput: {
        backgroundColor: '#444',
        padding: 8,
        borderRadius: 5,
        color: 'white',
        },
        taskOptionButton: {
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
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
        backgroundColor: '#555',
        width: '100%',
        marginVertical: 15,
        },
        cancelButton: {
        marginTop: 10,
        backgroundColor: '#555',
        padding: 12,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        },
        cancelButtonText: {
        color: 'white',
        fontSize: 14,
        },
        timeInputContainer: {
        marginBottom: 15,
        width: '100%',
        },
        navButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        },
        categoryButton: {
        padding: 10,
        borderRadius: 8,
        minWidth: 90,
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.mode === 'dark' ? '#444' : '#ddd',
        },
        categoryButtonText: {
        fontSize: 14,
        fontWeight: '500',
        },
        categoryModalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        categoryModalContent: {
        width: width - 40,
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        },
        categoryModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        },
        categoryOption: {
        width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginBottom: 8,
        },
        selectedCategoryOption: {
        backgroundColor: '#2196F3',
        },
        categoryOptionText: {
        fontSize: 16,
        textAlign: 'center',
        },
        selectedCategoryOptionText: {
        color: 'white',
        fontWeight: 'bold',
        },
});