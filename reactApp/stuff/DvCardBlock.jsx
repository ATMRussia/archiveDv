import React from 'react'
import PropTypes from 'prop-types'
import {
  Table, TableBody, TableRow, TableCell
} from '@material-ui/core'
import DvObjectProps from './DvObjectProps.jsx'
import moment from 'moment'
moment.locale('ru')
const dtFormat = 'DD.MM.YYYY hh:mm'

function humanSize (sizeInBytes) {
  if (sizeInBytes < 1024) return `${sizeInBytes}B`
  if (sizeInBytes < (1024 ** 2)) return `${(sizeInBytes / 1024).toFixed(1)}Kb`
  if (sizeInBytes < (1024 ** 3)) return `${(sizeInBytes / (1024 ** 2)).toFixed(1)}Mb`
  return `${(sizeInBytes / (1024 ** 3)).toFixed(2)}Gb`
}

function alwaysArray (item) {
  if (!item) {
    return []
  } else if (!(item instanceof Array)) {
    return [item]
  } else {
    return item
  }
}

function DvCardBlock (props) {
  const { doc } = props
  return <Table>
    <TableBody>
      <TableRow>
        <TableCell>Тип карточки</TableCell>
        <TableCell>{doc.CardTypeAlias}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Описание</TableCell>
        <TableCell>{doc.Description}</TableCell>
      </TableRow>
      {doc.strFolders && <TableRow>
        <TableCell>Папка</TableCell>
        <TableCell>{doc.strFolders}</TableCell>
      </TableRow>}
      {doc.Author && <TableRow>
        <TableCell>Автор</TableCell>
        <TableCell>{doc.Author.LastName} {doc.Author.FirstName}</TableCell>
      </TableRow>}
      {doc.binaryFileInfo && <TableRow>
        <TableCell>Файл</TableCell>
        <TableCell>
          <a href={`/getDvFile/${doc.binaryFileInfo.BinaryID}`}>{doc.binaryFileInfo.Name}</a>
          &nbsp;
          <span>Версия {doc.binaryFileInfo.version + 1}</span>
          &nbsp;
          <span>Версия {humanSize(doc.binaryFileInfo.size)}</span>
        </TableCell>
      </TableRow>}
      {/^(CardMessage)$/.test(doc.CardTypeAlias) && <React.Fragment>
        <TableRow>
          <TableCell>Тема</TableCell>
          <TableCell>{doc.sections?.MainInfo?.Subject}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Содержание</TableCell>
          <TableCell>{doc.sections?.MainInfo?.Body}</TableCell>
        </TableRow>
      </React.Fragment>}
      {/^(WorkflowTask)$/.test(doc.CardTypeAlias) && <React.Fragment>
        <TableRow>
          <TableCell>Коментарий</TableCell>
          <TableCell>{doc.sections?.MainInfo?.Comments}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Начало выполнения</TableCell>
          <TableCell>{moment(doc.sections?.Performing?.ActualStartDate).format(dtFormat)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Завершение выполнения</TableCell>
          <TableCell>{moment(doc.sections?.Performing?.ActualEndDate).format(dtFormat)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Статус задачи</TableCell>
          <TableCell>{doc.sections?.Performing?.TaskState}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Исполнители задачи</TableCell>
          <TableCell>{doc.Performers.map((performer, performerIdx) => (
            <span key={'Performer' + performerIdx}>{performer.LastName + ' ' + performer.FirstName}</span>
          ))}</TableCell>
        </TableRow>

      </React.Fragment>}
      {Object.keys(doc.fields).map((key, idx) => (<TableRow key={`field${idx}`}>
        <TableCell>{key}</TableCell>
        <TableCell>{
          doc.fields[key] instanceof Array ? doc.fields[key].map((arEl, arIdx) => (
            <DvObjectProps key={`field${idx}_ar${arIdx}`} obj={arEl}/>
          )) : <DvObjectProps obj={doc.fields[key]}/>
        }</TableCell>
      </TableRow>))}
      {doc.sections.CompletionParams && alwaysArray(doc.sections.CompletionParams).map((CompletionParam, idx) => (
        <TableRow key={`CompletionParams_${idx}`}>
          <TableCell>{CompletionParam.SelectionName}</TableCell>
          <TableCell>{CompletionParam.SelectedValue}</TableCell>
        </TableRow>
      ))}
      {/* Object.keys(doc.sections).map((key, idx) => (<TableRow key={`section_${key}`}>
        <TableCell>{key}</TableCell>
        <TableCell>{
          doc.sections[key] instanceof Array ? doc.sections[key].map((arEl, arIdx) => (
            <DvObjectProps key={`section_${key}_ar${arIdx}`} obj={arEl}/>
          )) : <DvObjectProps obj={doc.sections[key]}/>
        }</TableCell>
      </TableRow>)) */}
    </TableBody>
  </Table>
}
DvCardBlock.propTypes = {
  doc: PropTypes.object
}
export default DvCardBlock
