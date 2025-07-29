import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table as TableIcon, 
  Plus, 
  Minus, 
  Copy,
  Check,
  Trash2,
  Settings,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableCell {
  content: string;
  isHeader: boolean;
}

interface TableEditorProps {
  onInsertTable?: (markdown: string) => void;
  className?: string;
}

const TableEditor: React.FC<TableEditorProps> = ({
  onInsertTable,
  className = ''
}) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [tableData, setTableData] = useState<TableCell[][]>([
    [{ content: 'Header 1', isHeader: true }, { content: 'Header 2', isHeader: true }, { content: 'Header 3', isHeader: true }],
    [{ content: 'Cell 1', isHeader: false }, { content: 'Cell 2', isHeader: false }, { content: 'Cell 3', isHeader: false }],
    [{ content: 'Cell 4', isHeader: false }, { content: 'Cell 5', isHeader: false }, { content: 'Cell 6', isHeader: false }]
  ]);
  const [copied, setCopied] = useState(false);

  const updateTableSize = (newRows: number, newCols: number) => {
    const newData: TableCell[][] = [];
    
    for (let i = 0; i < newRows; i++) {
      const row: TableCell[] = [];
      for (let j = 0; j < newCols; j++) {
        if (i < tableData.length && j < tableData[i]?.length) {
          row.push(tableData[i][j]);
        } else {
          row.push({ content: '', isHeader: i === 0 });
        }
      }
      newData.push(row);
    }
    
    setTableData(newData);
    setRows(newRows);
    setCols(newCols);
  };

  const updateCell = (rowIndex: number, colIndex: number, content: string) => {
    const newData = [...tableData];
    newData[rowIndex][colIndex].content = content;
    setTableData(newData);
  };

  const toggleHeader = (rowIndex: number, colIndex: number) => {
    const newData = [...tableData];
    newData[rowIndex][colIndex].isHeader = !newData[rowIndex][colIndex].isHeader;
    setTableData(newData);
  };

  const addRow = () => {
    const newRow: TableCell[] = [];
    for (let j = 0; j < cols; j++) {
      newRow.push({ content: '', isHeader: false });
    }
    setTableData([...tableData, newRow]);
    setRows(rows + 1);
  };

  const removeRow = (rowIndex: number) => {
    if (rows > 1) {
      const newData = tableData.filter((_, index) => index !== rowIndex);
      setTableData(newData);
      setRows(rows - 1);
    }
  };

  const addColumn = () => {
    const newData = tableData.map(row => [...row, { content: '', isHeader: row[0]?.isHeader || false }]);
    setTableData(newData);
    setCols(cols + 1);
  };

  const removeColumn = (colIndex: number) => {
    if (cols > 1) {
      const newData = tableData.map(row => row.filter((_, index) => index !== colIndex));
      setTableData(newData);
      setCols(cols - 1);
    }
  };

  const generateMarkdown = (): string => {
    let markdown = '';
    
    // Add header row
    const headerRow = tableData[0] || [];
    markdown += '| ' + headerRow.map(cell => cell.content || ' ').join(' | ') + ' |\n';
    
    // Add separator row
    markdown += '| ' + headerRow.map(() => '---').join(' | ') + ' |\n';
    
    // Add data rows
    for (let i = 1; i < tableData.length; i++) {
      const row = tableData[i] || [];
      markdown += '| ' + row.map(cell => cell.content || ' ').join(' | ') + ' |\n';
    }
    
    return markdown.trim();
  };

  const copyMarkdown = async () => {
    const markdown = generateMarkdown();
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onInsertTable?.(markdown);
    } catch (err) {
      console.error('Failed to copy markdown:', err);
    }
  };

  const clearTable = () => {
    const newData: TableCell[][] = [];
    for (let i = 0; i < rows; i++) {
      const row: TableCell[] = [];
      for (let j = 0; j < cols; j++) {
        row.push({ content: '', isHeader: i === 0 });
      }
      newData.push(row);
    }
    setTableData(newData);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TableIcon className="w-5 h-5" />
            <span>Table Editor</span>
            <Badge variant="secondary" className="text-xs">
              {rows}×{cols}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearTable}
            >
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyMarkdown}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Table Size Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Rows:</label>
            <Input
              type="number"
              min="1"
              max="20"
              value={rows}
              onChange={(e) => updateTableSize(parseInt(e.target.value) || 1, cols)}
              className="w-16"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Columns:</label>
            <Input
              type="number"
              min="1"
              max="10"
              value={cols}
              onChange={(e) => updateTableSize(rows, parseInt(e.target.value) || 1)}
              className="w-16"
            />
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={addRow}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeRow(rows - 1)}
              className="h-8 w-8 p-0"
              disabled={rows <= 1}
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={addColumn}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeColumn(cols - 1)}
              className="h-8 w-8 p-0"
              disabled={cols <= 1}
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Table Editor */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden border border-border/50 rounded-lg">
              <table className="min-w-full divide-y divide-border/50">
                <tbody className="divide-y divide-border/30">
                  {tableData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="bg-background">
                      {row.map((cell, colIndex) => (
                        <td
                          key={colIndex}
                          className={cn(
                            "px-3 py-2 border-r border-border/30 last:border-r-0",
                            cell.isHeader && "bg-muted/50 font-medium"
                          )}
                        >
                          <div className="flex items-center space-x-2">
                            <Input
                              value={cell.content}
                              onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                              className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0"
                              placeholder={cell.isHeader ? 'Header' : 'Cell'}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => toggleHeader(rowIndex, colIndex)}
                            >
                              <Settings className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      ))}
                      <td className="px-2 py-2 border-l border-border/30">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                          onClick={() => removeRow(rowIndex)}
                          disabled={rows <= 1}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Column Controls */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Remove columns:</span>
          {Array.from({ length: cols }, (_, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
              onClick={() => removeColumn(index)}
              disabled={cols <= 1}
            >
              <Minus className="w-3 h-3" />
            </Button>
          ))}
        </div>

        {/* Preview */}
        <div className="p-4 bg-muted/20 rounded-lg">
          <h5 className="font-medium mb-2">Markdown Preview:</h5>
          <pre className="text-sm bg-background p-3 rounded border overflow-x-auto">
            {generateMarkdown()}
          </pre>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-muted/20 rounded-lg">
          <h5 className="font-medium mb-2">How to use:</h5>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Adjust rows and columns using the controls above</li>
            <li>• Click the settings icon to toggle header cells</li>
            <li>• Use the copy button to insert the table into your content</li>
            <li>• First row is automatically treated as header</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TableEditor; 