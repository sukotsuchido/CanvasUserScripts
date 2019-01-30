# CanvasUserScripts
UserScripts for Canvas LMS

<b>Canvas Crosslisting.user.js</b> is a very basic tool in which the user inputs the course number of the parent course and child course and then the two are crosslisted together.

<b>instructor and admin crosslisting tools.js</b> is a more robust script in which the instructor's current term courses are loaded in a dropdown menu to choose the parent course. Then the remaining courses are dynamically created and are selectable to be child courses. Finally, the instructor can rename the parent course and submit to finalize the crosslisting and renaming actions. The instructor can also choose to crosslist without renaming and rename without crosslisting. On the subaccount page, it also adds the ability for root level admins to search for a user and then perform the same tasks as an instructor.

<b> Canvas Course Event Manager </b> is a script that will allow a user to remove the dates or delete events from a course calendar. The user can select all events displayed (100 at a time) or select specific events.

<b> Canvas Remove Student Tool </b> is a script that will allow an admin to remove students from courses in bulk. The table is sortable by name or last activity date. The "Add More" button will load the next 100 students. It is useful for managing manually created course enrollments for clubs, activities, and special courses.

<b> Print Canvas Quizzes </b> is a script that will allow a user to print a quiz from the preview page. 
<ol>
  <li>Features</li>
  <ol type="A">
    <li>Adds a "Print Quiz" button below the question navigation pane.</li>
    <li>Auto-page break: This will keep all question content on the same page and prevents a page break in the middle of a question.</li>
    <li>The page is set to zoom to 74% to make it sized appropriately for printing.</li>
    <li>Adjusts certain question types for legibility and space efficiency</li>
    <li>Hides "This is a preview..." banner and "Submit Quiz" button</li>
    <li>The print dialog will automatically pop-up for the user</li>
    <ul>
      <li>Multiple Choice: Left aligns choices, all one column</li>
      <li>Matching: Removes drop-down menu and creates a "answer bank" at the bottom of the question box</li>
      <li>Multiple Dropdowns: Expands the dropdowns to width and height of content</li>
    </ul>
  </ol>
  <li>Limitations</li>
  <ol type="A">
    <li>The quiz must be viewed from the "Preview Quiz" page</li>
    <li>All questions must be visible on the page, which means the "Show one question at a time" must be unchecked</li>
    <li>Currently, the zoom level of the page is not editable by the user, except through the printer dialog window</li>
    <li>Not usable in the Quizzez.next LTI</li>
  </ol>
  </ol>
  
  <b>Remove Color Overlay</b> is a script that removes the color overlay of courses with course images on the Dashboard. This is a workaround since admin is unable to set the default Dashboard experience for users.
